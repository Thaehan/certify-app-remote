/*
 * Copyright (c) 2020 Certis CISCO Security Pte Ltd
 * All rights reserved.
 *
 * This software is the confidential and proprietary information of
 * Certis CISCO Security Pte Ltd. ("Confidential Information").
 * You shall not disclose such Confidential Information and shall use
 * it only in accordance with the terms of the license agreement you
 * entered into with Certis CISCO Security Pte Ltd.
 */
import { observable, action, runInAction } from "mobx";
import { Alert, Platform } from "react-native";
import {
    CognitoUser,
    AuthenticationDetails,
    CognitoUserSession,
    CognitoUserAttribute,
    IMfaSettings,
    ChallengeName,
} from "amazon-cognito-identity-js";
import { AppVersion } from "../nativeUtils/NativeModules";
import { HttpClient } from "../utils/HttpClient";
import { I18n } from "../utils/I18n";
import { Environment } from "../utils/Environment";
import { RootStore } from "./RootStore";
import { VerifyDetail } from "./ForgotPasswordStore";
import { NavigationService } from "../navigators/NavigationService";

export type LoginStep =
    | "Initial"
    | "TempPassword"
    | "MFA"
    | "Success"
    | "TOTP"
    | "SelectPreferMethod"
    | "SmsSetup"
    | "TotpSetup"
    | "MfaSetupSuccess";
type OtpMode = "MFA" | "Verify" | "14Days" | "SetupSmsMfa";
type SetupType = "SMS" | "TOTP" | null;
export type preferMethod = "TOTP" | "SMS" | "None";
interface MFAOptionResponse {
    methods: ("SOFTWARE_TOKEN" | "SMS")[];
}

/**
 * Service handle cognito user authentication flow
 *
 * @author Lingqi
 */
export class AuthenticateStore {
    private rootStore: RootStore;
    private cognitoUser!: CognitoUser;

    @observable private username!: string;
    private password!: string;

    private mfaDone: boolean;
    private part14Days: string;
    private session!: CognitoUserSession;

    @observable loginStep: LoginStep;
    @observable isFetching: boolean;
    @observable emptyPassword: boolean;
    @observable totpSecret = "";
    @observable otpMode: OtpMode;
    @observable mfaSetupType: SetupType;
    @observable userMFASettingList: string[];
    @observable preferredMfaSetting: string;
    @observable userPoolMFAOption: MFAOptionResponse;

    private _verifyDetail: VerifyDetail;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
        this.otpMode = "MFA";
        this.mfaDone = false;
        this.part14Days = "";
        this.loginStep = "Initial";
        this.emptyPassword = true;
        this.isFetching = false;
        this._verifyDetail = {
            type: "email",
            value: "username@email.com",
        };
        this.mfaSetupType = null;
        this.userMFASettingList = [];
        this.preferredMfaSetting = "";
        this.userPoolMFAOption = { methods: [] };
    }

    get verifyDetail(): VerifyDetail {
        return this._verifyDetail;
    }
    @action setTOTPSecret(totpSecret: string) {
        this.totpSecret = totpSecret;
    }
    @action setLoginStep(step: LoginStep) {
        this.loginStep = step;
    }
    @action setPreferredMfaSetting(preferredMfaSetting: string) {
        this.preferredMfaSetting = preferredMfaSetting;
    }
    @action setCognitoUser(cognitoUser: CognitoUser) {
        this.cognitoUser = cognitoUser;
    }
    authenticateUserBiometrics(appId?: string): Promise<undefined> {
        return new Promise((resolve, reject) => {
            this.rootStore.biometricStore
                .retrieveCredentials()
                .then((userCreds) => {
                    if (userCreds) {
                        this.authenticateUser(
                            userCreds.username,
                            userCreds.password,
                            appId
                        )
                            .then()
                            .catch((reason) => {
                                console.log("Authenticate error: " + reason);
                                reject(I18n.toErrorMessage(reason.message));
                            });
                    }
                })
                .catch((reason) => {
                    console.log("Creds retrieve error: " + reason);
                    reject(reason);
                });
        });
    }

    addBiometricFunctionality(): Promise<boolean> {
        return this.rootStore.biometricStore.addBiometric(
            this.username,
            this.password
        );
    }

    @action
    authenticateUser(
        username: string,
        password: string,
        appId?: string
    ): Promise<undefined> {
        this.isFetching = true;
        return new Promise((resolve, reject) => {
            this.cognitoUser =
                this.rootStore.userPoolStore.createCognitoUser(username);
            this.username = username;
            this.password = password;
            const authenticationDetails = new AuthenticationDetails({
                Username: username,
                Password: password,
                ValidationData: {
                    appId,
                    appVersion: AppVersion.versionName,
                    platform: Platform.OS === "android" ? "Android" : "iOS",
                },
            });
            this.cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: (session) => {
                    this.session = session;
                    this.checkVerified(resolve, reject);
                },
                onFailure: (err: Error) => {
                    runInAction(() => {
                        this.isFetching = false;
                        reject(I18n.toErrorMessage(err.message));
                    });
                },
                newPasswordRequired: () => {
                    runInAction(() => {
                        this.isFetching = false;
                        this.loginStep = "TempPassword";
                    });
                },
                selectMFAType: (challengeName, challengeParameters) => {
                    this.handleSelectMFAType(
                        challengeName,
                        challengeParameters
                    );
                },
                mfaSetup: (challengeName, challengeParameters) =>
                    this.handleMfaSetupCallback(
                        challengeName,
                        challengeParameters
                    ),
                mfaRequired: async (challengeName, challengeParameters) => {
                    this._verifyDetail = {
                        type: "phone_number",
                        value: challengeParameters["CODE_DELIVERY_DESTINATION"],
                    };
                    runInAction(() => {
                        this.isFetching = false;
                        this.loginStep = "MFA";
                    });
                },
                totpRequired: (challengeName, challengeParameters) => {
                    runInAction(() => {
                        this.isFetching = false;
                        this.loginStep = "TOTP";
                    });
                },
            });
        });
    }
    @action
    handleSelectMFAType(
        challengeName: ChallengeName,
        challengeParameters: any
    ): void {
        this.isFetching = false;
        this.loginStep = "SelectPreferMethod";
        const params = challengeParameters["MFAS_CAN_CHOOSE"];
        switch (true) {
            case params.includes("SMS_MFA") &&
                params.includes("SOFTWARE_TOKEN_MFA"):
                this.loginStep = "SelectPreferMethod";
                break;
            case params.includes("SMS_MFA"):
                this.loginStep = "MFA";
                break;
            case params.includes("SOFTWARE_TOKEN_MFA"):
                this.loginStep = "TOTP";
                break;
        }
    }
    @action
    handleMfaSetupCallback(
        challengeName: ChallengeName,
        challengeParameters: any
    ) {
        this.isFetching = true;
        const params = challengeParameters["MFAS_CAN_SETUP"];
        switch (true) {
            case params.includes("SMS_MFA") &&
                params.includes("SOFTWARE_TOKEN_MFA"):
                this.loginStep = "SelectPreferMethod";
                break;
            case params.includes("SMS_MFA"):
                this.selectPreferSms();
                break;
            case params.includes("SOFTWARE_TOKEN_MFA"):
                this.loginStep = "TOTP";
                break;
        }
    }
    @action
    changeTempPassword(newPassword: string): Promise<undefined> {
        this.isFetching = true;
        return new Promise((resolve, reject) => {
            this.password = newPassword;
            this.cognitoUser.completeNewPasswordChallenge(newPassword, null, {
                onSuccess: (session) => {
                    this.session = session;
                    this.checkVerified(resolve, reject);
                },
                onFailure: (err: Error) => {
                    runInAction(() => {
                        this.isFetching = false;
                        reject(I18n.toErrorMessage(err.message));
                    });
                },
                mfaRequired: (challengeName, challengeParameters) => {
                    this._verifyDetail = {
                        type: "phone_number",
                        value: challengeParameters["CODE_DELIVERY_DESTINATION"],
                    };
                    runInAction(() => {
                        this.isFetching = false;
                        this.loginStep = "MFA";
                    });
                },
            });
        });
    }
    @action
    getUserPoolMFAOptions(): Promise<MFAOptionResponse> {
        return new Promise((resolve, reject) => {
            this.isFetching = true;
            const url = Environment.endPoint + "/mfa/settings";
            return HttpClient.get<MFAOptionResponse>(url, {
                withCredentials: true,
            })
                .then((response) => {         
                    runInAction(() => {
                        this.isFetching = false;
                        this.userPoolMFAOption = response;
                    });
                    resolve(response);
                })
                .catch((reason) => {
                    this.isFetching = false;
                    reject(I18n.toErrorMessage(reason));
                });
        });
    }
    @action
    sendMFACode(
        code: string,
        mfaType: "SOFTWARE_TOKEN_MFA" | "SMS_MFA" = "SMS_MFA"
    ): Promise<undefined> {
        this.isFetching = true;
        return new Promise((resolve, reject) => {
            switch (this.otpMode) {
                case "MFA":
                    this.cognitoUser.sendMFACode(
                        code,
                        {
                            onSuccess: (session) => {
                                this.session = session;
                                this.mfaDone = true;
                                this.handleSuccess();
                            },
                            onFailure: (err: Error) => {
                                runInAction(() => {
                                    this.isFetching = false;
                                    reject(I18n.toErrorMessage(err.message));
                                });
                            },
                        },
                        mfaType
                    );
                    break;
                case "Verify":
                    this.cognitoUser.verifyAttribute(
                        this.verifyDetail.type,
                        code,
                        {
                            onSuccess: () => {
                                this.mfaDone = true;
                                let smsMfaSettings = {
                                    PreferredMfa: true,
                                    Enabled: true,
                                };
                                this.setUserMfaPreference(smsMfaSettings, null);
                                this.handleSuccess();
                            },
                            onFailure: (err) => {
                                runInAction(() => {
                                    this.isFetching = false;
                                    reject(I18n.toErrorMessage(err.message));
                                });
                            },
                        }
                    );
                    break;
                case "14Days":
                    const url = Environment.endPoint + "/mfa/verify";
                    const body = {
                        part: this.part14Days,
                        code,
                    };
                    HttpClient.post(url, { body, withCredentials: true })
                        .then(() => {
                            this.mfaDone = true;
                            this.handleSuccess();
                        })
                        .catch((reason) => {
                            runInAction(() => {
                                this.isFetching = false;
                                reject(I18n.toErrorMessage(reason));
                            });
                        });
                    break;
            }
        });
    }

    @action
    resendOTP(): Promise<undefined> {
        this.isFetching = true;
        return new Promise((resolve, reject) => {
            switch (this.otpMode) {
                case "MFA":
                    const authenticationDetails = new AuthenticationDetails({
                        Username: this.username,
                        Password: this.password,
                    });
                    this.cognitoUser.authenticateUser(authenticationDetails, {
                        onSuccess: () => {},
                        onFailure: (err: Error) => {
                            runInAction(() => {
                                this.isFetching = false;
                                reject(I18n.toErrorMessage(err.message));
                            });
                        },
                        mfaRequired: () => {
                            runInAction(() => {
                                this.isFetching = false;
                            });
                        },
                    });
                    break;
                case "Verify":
                    this.cognitoUser.getAttributeVerificationCode(
                        this.verifyDetail.type,
                        {
                            onSuccess: () => {
                                runInAction(() => {
                                    this.isFetching = false;
                                });
                            },
                            onFailure: (err) => {
                                runInAction(() => {
                                    this.isFetching = false;
                                    reject(I18n.toErrorMessage(err.message));
                                });
                            },
                        }
                    );
                    break;
                case "14Days":
                    const url = Environment.endPoint + "/mfa/trigger";
                    const body = { token: this.session.getIdToken() };
                    HttpClient.post(url, { body, withCredentials: true })
                        .then(() => {
                            runInAction(() => {
                                this.isFetching = false;
                            });
                        })
                        .catch((reason) => {
                            runInAction(() => {
                                this.isFetching = false;
                                reject(I18n.toErrorMessage(reason));
                            });
                        });
                    break;
            }
        });
    }

    @action
    emptyPasswordCheck(password: string) {
        runInAction(() => {
            this.emptyPassword = password.length < 1;
        });
    }

    @action
    clearStates() {
        this.otpMode = "MFA";
        this.mfaDone = false;
        this.loginStep = "Initial";
        this.isFetching = false;
        this.emptyPassword = true;
    }

    private checkVerified(
        resolve: () => void,
        reject: (reason: string) => void
    ): void {
        let verified = true;
        let verifyType: "phone_number" | "email";
        if (!this.session.getIdToken().payload["email_verified"]) {
            verified = false;
            verifyType = "email";
        } else if (
            !this.session.getIdToken().payload["phone_number_verified"]
        ) {
            verified = false;
            verifyType = "phone_number";
        }

        if (verified) {
            this.check14Days(resolve, reject);
        } else {
            this.otpMode = "Verify";
            this.cognitoUser.getAttributeVerificationCode(verifyType!, {
                onSuccess: () => {},
                onFailure: (err) => {
                    runInAction(() => {
                        this.isFetching = false;
                        reject(I18n.toErrorMessage(err.message));
                    });
                },
                inputVerificationCode: (data: any) => {
                    this._verifyDetail = {
                        type: data["CodeDeliveryDetails"]["AttributeName"],
                        value: data["CodeDeliveryDetails"]["Destination"],
                    };
                    runInAction(() => {
                        this.isFetching = false;
                        this.loginStep = "MFA";
                    });
                },
            });
        }
    }

    private check14Days(
        resolve: () => void,
        reject: (reason: string) => void
    ): void {
        const userPoolStore = this.rootStore.userPoolStore;
        const callbackStore = this.rootStore.callbackStore;
        let url = Environment.endPoint + "/mfa/check";
        const body: { [key: string]: any } = {
            token: this.session.getIdToken().getJwtToken(),
        };
        if (callbackStore.sessionId) {
            body["sessionId"] = callbackStore.sessionId;
        } else {
            body["accountId"] = userPoolStore.accountId;
        }
        HttpClient.post<Check14DaysResponse>(url, {
            body,
            withCredentials: true,
        })
            .then((resp) => {
                if (resp.challenge !== "MFA") {
                    this.handleSuccess();
                } else {
                    this.otpMode = "14Days";
                    url = Environment.endPoint + "/mfa/trigger";
                    HttpClient.post<Trigger14DaysResponse>(url, {
                        body,
                        withCredentials: true,
                    })
                        .then((response) => {
                            this.part14Days = response.part;
                            this._verifyDetail = {
                                type: "phone_number",
                                value: response.phone,
                            };
                            runInAction(() => {
                                this.isFetching = false;
                                this.loginStep = "MFA";
                            });
                        })
                        .catch((reason) => {
                            runInAction(() => {
                                this.isFetching = false;
                                reject(I18n.toErrorMessage(reason));
                            });
                        });
                }
            })
            .catch((reason) => {
                runInAction(() => {
                    this.isFetching = false;
                    reject(I18n.toErrorMessage(reason));
                });
            });
    }

    private async handleSuccess(): Promise<void> {
        const userPoolStore = this.rootStore.userPoolStore;
        const sessionStore = this.rootStore.cognitoSessionStore;
        const callbackStore = this.rootStore.callbackStore;
        if (this.mfaDone && this.otpMode !== "14Days") {
            const url = Environment.endPoint + "/mfa/update";
            const body: { [key: string]: any } = {
                token: this.session.getIdToken().getJwtToken(),
            };
            if (callbackStore.sessionId) {
                body["sessionId"] = callbackStore.sessionId;
            } else {
                body["accountId"] = userPoolStore.accountId;
            }
            HttpClient.post(url, { body })
                .then(() => {
                    this.mfaDone = false;
                    this.handleSuccess();
                })
                .catch((err) => {
                    console.error("Error updating MFA:", err);
                });
        } else {
            let isSetupPrefer = await this.isSetPreferMethod();
            sessionStore.onAuthSuccess().then(async (success) => {
                if (isSetupPrefer) {
                    if (success) {
                        runInAction(() => {
                            this.isFetching = false;
                            this.loginStep = "Success";
                        });
                    }
                } else {
                    runInAction(() => {
                        this.loginStep = "SelectPreferMethod";
                        this.isFetching = false;
                    });
                }
            });
        }
    }
    @action async associateSoftwareToken() {
        try {
            const sessionStore = this.rootStore.cognitoSessionStore;
            await new Promise<void>((resolve, reject) => {
                if (!sessionStore.currentCognitoUser) {
                    reject("There is no user session");
                    return;
                }
                sessionStore.currentCognitoUser.associateSoftwareToken({
                    associateSecretCode: (secretCode: string) => {
                        // Handle the secretCode, you might want to store it in state or use it as needed
                        runInAction(() => {
                            this.setTOTPSecret(secretCode);
                            this.loginStep = "TotpSetup";
                            this.isFetching = false;
                        });
                        resolve();
                    },
                    onFailure: (err: any) => reject(err),
                });
            });
        } catch (error) {
            console.error("Error associating software token", error);
            throw error;
        }
    }
    @action async setUserMfaPreference(
        smsMfaSettings: IMfaSettings | null,
        totpMfaSettings: IMfaSettings | null
    ) {
        try {
            const sessionStore = this.rootStore.cognitoSessionStore;

            await new Promise<void>((resolve, reject) => {
                if (!sessionStore.currentCognitoUser) {
                    reject("There is no user session");
                    return;
                }
                this.cognitoUser.setUserMfaPreference(
                    smsMfaSettings,
                    totpMfaSettings,
                    (err, result) => {
                        if (err) {
                            Alert.alert(
                                I18n.t("alert.title.expired"),
                                I18n.t("alert.session_expired"),
                                [
                                    {
                                        text: I18n.t("alert.button.ok"),
                                        onPress: () => {
                                            sessionStore.signOut();
                                            NavigationService.navigate(
                                                "Auth/Login"
                                            );
                                        },
                                        style: "cancel",
                                    },
                                ],
                                { cancelable: false }
                            );
                        }
                    }
                );
            });
        } catch (error) {
            console.error("Error setting user MFA preference", error);
            throw error;
        }
    }
    @action async associateSecretCode(totpCode: string, appId: string) {
        try {
            const sessionStore = this.rootStore.cognitoSessionStore;
            return new Promise<void>((resolve, reject) => {
                if (!sessionStore.currentCognitoUser) {
                    reject("There is no user session");
                    return;
                }
                sessionStore.currentCognitoUser.verifySoftwareToken(
                    totpCode,
                    "Certify",
                    {
                        onSuccess: async (session) => {
                            runInAction(() => {
                                this.session = session;
                                this.mfaDone = true;
                            });
                            sessionStore
                                .onAuthSuccess()
                                .then(async (success) => {
                                    if (success) {
                                        let totpMfaSettings = {
                                            PreferredMfa: true,
                                            Enabled: true,
                                        };

                                        this.setUserMfaPreference(
                                            null,
                                            totpMfaSettings
                                        );
                                        runInAction(() => {
                                            this.isFetching = false;
                                            this.mfaSetupType = "TOTP";
                                            this.loginStep = "MfaSetupSuccess";
                                        });
                                    }
                                });
                            resolve();
                        },
                        onFailure: (err) => {
                            runInAction(() => {
                                this.isFetching = false;
                                reject(I18n.toErrorMessage(err.message));
                            });
                        },
                    }
                );
            });
        } catch (error) {
            console.error("Error associating software token", error);
            throw error;
        }
    }

    @action
    async isSetPreferMethod() {
        try {
            const sessionStore = this.rootStore.cognitoSessionStore;
            if (this.cognitoUser) {
                return await new Promise<boolean>((resolve, reject) => {
                    this.cognitoUser.getUserData(
                        (err, data) => {
                            if (err) {
                                reject(err);
                                Alert.alert(
                                    I18n.t("alert.title.expired"),
                                    I18n.t("alert.session_expired"),
                                    [
                                        {
                                            text: I18n.t("alert.button.ok"),
                                            onPress: () => {
                                                sessionStore.signOut();
                                                NavigationService.navigate(
                                                    "Auth/Login"
                                                );
                                            },
                                            style: "cancel",
                                        },
                                    ],
                                    { cancelable: false }
                                );
                            }
                            if (data) {
                                const {
                                    PreferredMfaSetting,
                                    UserMFASettingList,
                                } = data;
                                resolve(PreferredMfaSetting ? true : false);
                            }
                        },
                        { bypassCache: true }
                    );
                });
            } else {
                console.error("associateSoftwareToken is not supported");
                // Handle the case where the method is not available
            }
        } catch (error) {
            console.error("Error associating software token", error);
            throw error;
        }
    }
    @action
    async selectPreferSms() {
        let phoneNumberAttribute = await this.getUserAttribute("phone_number");
        if (phoneNumberAttribute) {
            this.otpMode = "SetupSmsMfa";
            this.cognitoUser.getAttributeVerificationCode("phone_number", {
                onSuccess: () => {},
                onFailure: (err) => {
                    runInAction(() => {
                        this.isFetching = false;
                        reject(I18n.toErrorMessage(err.message));
                    });
                },
                inputVerificationCode: (data: any) => {
                    this._verifyDetail = {
                        type: data["CodeDeliveryDetails"]["AttributeName"],
                        value: data["CodeDeliveryDetails"]["Destination"],
                    };
                    runInAction(() => {
                        this.isFetching = false;
                        this.loginStep = "SmsSetup";
                    });
                },
            });
        } else {
            Alert.alert(
                I18n.t("alert.title.phone_number_required"),
                I18n.t("alert.phone_number_require"),
                [
                    {
                        text: I18n.t("alert.button.ok"),
                        style: "cancel",
                    },
                ],
                { cancelable: false }
            );
        }
    }

    @action
    async getUserAttribute(
        attributeName: string
    ): Promise<CognitoUserAttribute | undefined> {
        const sessionStore = this.rootStore.cognitoSessionStore;
        return await new Promise<CognitoUserAttribute | undefined>(
            (resolve, reject) => {
                this.cognitoUser.getUserAttributes(function (err, result) {
                    if (err) {
                        Alert.alert(
                            I18n.t("alert.title.expired"),
                            I18n.t("alert.session_expired"),
                            [
                                {
                                    text: I18n.t("alert.button.ok"),
                                    onPress: () => {
                                        sessionStore.signOut();
                                        NavigationService.navigate(
                                            "Auth/Login"
                                        );
                                    },
                                    style: "cancel",
                                },
                            ],
                            { cancelable: false }
                        );
                        reject(err);
                        return;
                    }
                    if (result) {
                        const attributeObj = result.find(
                            (attribute) => attribute.Name == attributeName
                        );
                        return resolve(attributeObj);
                    }
                });
            }
        );
    }
    @action async sendCodeSmsMFA(code: string): Promise<undefined> {
        this.isFetching = true;
        const sessionStore = this.rootStore.cognitoSessionStore;

        return new Promise((resolve, reject) => {
            this.cognitoUser.verifyAttribute("phone_number", code, {
                onSuccess: () => {
                    // this.handleSuccess();
                    sessionStore.onAuthSuccess().then(async (success) => {
                        if (success) {
                            let smsMfaSettings = {
                                PreferredMfa: true,
                                Enabled: true,
                            };
                            this.setUserMfaPreference(smsMfaSettings, null);
                            runInAction(() => {
                                this.mfaSetupType = "SMS";
                                this.isFetching = false;
                                this.loginStep = "MfaSetupSuccess";
                            });
                        }
                    });
                },
                onFailure: (err) => {
                    runInAction(() => {
                        this.isFetching = false;
                        reject(I18n.toErrorMessage(err.message));
                    });
                },
            });
        });
    }
    @action
    async getUserData() {
        try {
            const sessionStore = this.rootStore.cognitoSessionStore;
            this.isFetching = true;
            return await new Promise<{
                PreferredMfaSetting: string;
                UserMFASettingList: string[];
            }>((resolve, reject) => {
                if (!sessionStore.currentCognitoUser) {
                    reject("There is no user session");
                    return;
                }
                this.cognitoUser.getUserData(
                    (err, data) => {
                        if (err) {
                            reject(err);
                            this.isFetching = false;
                            Alert.alert(
                                I18n.t("alert.title.expired"),
                                I18n.t("alert.session_expired"),
                                [
                                    {
                                        text: I18n.t("alert.button.ok"),
                                        onPress: () => {
                                            sessionStore.signOut();
                                            NavigationService.navigate(
                                                "Auth/Login"
                                            );
                                        },
                                        style: "cancel",
                                    },
                                ],
                                { cancelable: false }
                            );
                        }
                        if (data) {
                            const { PreferredMfaSetting, UserMFASettingList } =
                                data;
                            runInAction(() => {
                                this.isFetching = false;
                                this.userMFASettingList = UserMFASettingList;
                                this.preferredMfaSetting = PreferredMfaSetting
                                    ? PreferredMfaSetting
                                    : "None";
                            });

                            resolve({
                                PreferredMfaSetting,
                                UserMFASettingList,
                            });
                        }
                    },
                    { bypassCache: true }
                );
            });
        } catch (error) {
            throw error;
        }
    }
}

interface Check14DaysResponse {
    challenge: "" | "MFA";
}
interface Trigger14DaysResponse {
    part: string;
    phone: string;
}
