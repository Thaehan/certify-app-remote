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
import { Alert } from "react-native";
import {
    CognitoUser,
    CognitoUserSession,
    UserData,
} from "amazon-cognito-identity-js";
import { NavigationService } from "../navigators/NavigationService";
import { RootStore } from "./RootStore";
import I18n, { toErrorMessage } from "../utils/I18n";

/**
 * Service handle cognito user session
 *
 * @author Lingqi
 */
export class CognitoSessionStore {
    private rootStore: RootStore;
    private cognitoUser!: CognitoUser;
    private userSession?: CognitoUserSession;

    private readonly REFRESH_THRESHOLD = 300;
    private timerId!: ReturnType<typeof setInterval>;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    get currentSession(): CognitoUserSession | undefined {
        return this.userSession;
    }
    get currentCognitoUser(): CognitoUser | undefined {
        return this.cognitoUser;
    }
    displayName(): string {
        if (!this.userSession) {
            return "";
        }
        const idToken = this.userSession.getIdToken();
        let name = idToken.payload["name"];
        if (!name) {
            name = idToken.payload["given_name"];
        }
        if (!name) {
            name = idToken.payload["family_name"];
        }
        return name || "";
    }

    onAuthSuccess(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.rootStore.userPoolStore
                .getCurrentUser()
                .then((currentUser) => {
                    if (!currentUser) {
                        resolve(false);
                        return;
                    }
                    this.cognitoUser = currentUser;
                    const session = this.cognitoUser.getSignInUserSession();
                    if (session) {
                        this.userSession = session;
                        this.cognitoUser.setDeviceStatusRemembered({
                            onSuccess: () => {},
                            onFailure: () => {},
                        });
                        this.observeValidity();
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                });
        });
    }

    getCachedSession(): Promise<CognitoUserSession> {
        return new Promise((resolve, reject) => {
            this.refreshToken().then(() => {
                if (this.userSession) {
                    resolve(this.userSession);
                    return;
                }
                this.rootStore.userPoolStore
                    .getCurrentUser()
                    .then(async (currentUser) => {
                        if (!currentUser) {
                            reject("no cached user");
                            return;
                        }
                        this.cognitoUser = currentUser;
                        this.rootStore.authenticateStore.setCognitoUser(
                            currentUser
                        );
                        this.cognitoUser.getSession(
                            (err: Error, session: CognitoUserSession) => {
                                if (err) {
                                    reject("no cached session");
                                    return;
                                }
                                this.userSession = session;
                                this.observeValidity();
                                resolve(this.userSession);
                            }
                        );
                    });
            });
        });
    }

    signOut(): void {
        if (this.timerId) {
            clearInterval(this.timerId);
        }
        this.cognitoUser.forgetDevice({
            onSuccess: () => {},
            onFailure: () => {},
        });
        this.cognitoUser.signOut();
        this.userSession = undefined;
    }

    changePassword(
        oldPassword: string,
        newPassword: string
    ): Promise<"SUCCESS"> {
        return new Promise((resolve, reject) => {
            this.cognitoUser.changePassword(
                oldPassword,
                newPassword,
                (err, result) => {
                    if (err) {
                        let message = err.message;
                        if (
                            message.includes(
                                "Member must have length greater than or equal to 6"
                            )
                        ) {
                            message =
                                "Member must have length greater than or equal to 6";
                        }
                        reject(toErrorMessage(message));
                    } else {
                        resolve(result);
                    }
                }
            );
        });
    }

    private observeValidity(): void {
        if (this.timerId) {
            clearInterval(this.timerId);
        }
        this.timerId = setInterval(
            this.refreshToken,
            this.REFRESH_THRESHOLD * 1000
        );
    }

    private onSessionExpired(): void {
        Alert.alert(
            I18n.t("alert.title.expired"),
            I18n.t("alert.session_expired"),
            [
                {
                    text: I18n.t("alert.button.ok"),
                    onPress: () => {
                        this.signOut();
                        NavigationService.navigate("Auth/Login");
                    },
                    style: "cancel",
                },
            ],
            { cancelable: false }
        );
    }

    private refreshToken(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.isValidForThreshold() && this.userSession) {
                const refreshToken = this.userSession.getRefreshToken();
                this.cognitoUser.refreshSession(
                    refreshToken,
                    (err: Error, session: CognitoUserSession) => {
                        if (err) {
                            resolve(this.onSessionExpired());
                        } else {
                            this.userSession = session;
                            resolve();
                        }
                    }
                );
            } else {
                console.log("Refresh not needed");
                //Refresh not needed
                resolve();
            }
        });
    }

    private isValidForThreshold(): boolean {
        if (!this.userSession) {
            return false;
        }
        const now = Math.floor(Date.now() / 1000);
        const adjusted = now - (this.userSession as any).getClockDrift();
        const accessToken = this.userSession.getAccessToken();
        const idToken = this.userSession.getIdToken();

        return (
            adjusted + this.REFRESH_THRESHOLD < accessToken.getExpiration() &&
            adjusted + this.REFRESH_THRESHOLD < idToken.getExpiration()
        );
    }
}
