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
import * as KeyChain from "react-native-keychain";
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { observable, action, runInAction, computed } from "mobx";
import { Keys } from "../utils/Constants";
import { Environment } from "../utils/Environment";
import I18n from "../utils/I18n";
import { RootStore } from "./RootStore";

export const BIOMETRICS_RETRIEVE_ERROR = "BIOMETRICS_RETRIEVE_ERROR";

/**
 * Service handling biometrics flow
 * To refactor into a class to fit existing design of the other stores
 * @author Mason
 */

const biometry_permission_map = new Map([
    [KeyChain.BIOMETRY_TYPE.FACE_ID, PERMISSIONS.IOS.FACE_ID],
]);

const biometry_type_map = new Map([
    [KeyChain.BIOMETRY_TYPE.FACE_ID, "face_id"],
    [KeyChain.BIOMETRY_TYPE.TOUCH_ID, "touch_id"],
    [KeyChain.BIOMETRY_TYPE.FINGERPRINT, "fingerprint"],
]);

type Nullable<T> = T | null;

export class BiometricStore {
    private rootStore: RootStore;
    private biometryType: Nullable<KeyChain.BIOMETRY_TYPE>;
    @observable savedBioType: string;
    @observable bioLocalisationKey: string;
    @observable bioSetupDoneBefore: boolean;
    @observable isBioEnabledByUser: boolean;
    @observable isLockedOut: boolean;
    @observable isBioSystemReady: boolean;
    private _isFirstBioSetup: boolean;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
        this.biometryType = null;
        this.savedBioType = "None";
        this.bioLocalisationKey = "None";
        this._isFirstBioSetup = false;
        this.bioSetupDoneBefore = false;
        this.isBioEnabledByUser = true;
        this.isBioSystemReady = false;
        this.isLockedOut = false;
        this.init();
    }

    @computed
    get isBioReady() {
        return this.bioSetupDoneBefore && this.isBioSystemReady;
    }

    @action
    async init() {
        AsyncStorage.getItem(Keys.SAVED_BIO_TYPE).then((savedBioType) => {
            runInAction(() => {
                this.savedBioType = (savedBioType as string) ?? "None";
            });
        });
        const isDoneBefore =
            JSON.parse(
                (await AsyncStorage.getItem(
                    Keys.FIRST_BIO_SETUP_DONE
                )) as string
            ) ?? false;
        runInAction(() => {
            this.bioSetupDoneBefore = isDoneBefore;
        });
        const isBioEnabledByUser: boolean =
            JSON.parse(
                (await AsyncStorage.getItem(Keys.BIO_ENABLED)) as string
            ) ?? true;
        runInAction(() => {
            this.isBioEnabledByUser = isBioEnabledByUser;
        });
        this.refreshBiometricState();
    }

    get isFirstBioSetup(): boolean {
        return this._isFirstBioSetup;
    }

    async refreshBiometricState() {
        await this.getBiometryType();
        this.isBiometricEnabledSystem();
    }

    @action
    async getBiometryType() {
        const bioType = await KeyChain.getSupportedBiometryType();
        this.biometryType = bioType;
        console.log("getBio: " + bioType);
        if (bioType !== null) {
            if (biometry_type_map.has(bioType)) {
                const bioLocaleKey = biometry_type_map.get(bioType)!;
                runInAction(() => {
                    this.bioLocalisationKey = bioLocaleKey;
                    if (
                        this.savedBioType == "None" ||
                        this.savedBioType != bioLocaleKey
                    ) {
                        this.savedBioType = this.bioLocalisationKey;
                        AsyncStorage.setItem(
                            Keys.SAVED_BIO_TYPE,
                            this.savedBioType
                        );
                    }
                });
            } else {
                runInAction(() => {
                    this.bioLocalisationKey = "None";
                });
            }
        } else {
            runInAction(() => {
                this.bioLocalisationKey = "None";
            });
        }
    }

    @action
    resetBiometrics() {
        KeyChain.resetInternetCredentials(Environment.biometricStoreId);
        AsyncStorage.setItem(Keys.FIRST_BIO_SETUP_DONE, JSON.stringify(false));
        this._isFirstBioSetup = false;
        runInAction(() => {
            this.bioSetupDoneBefore = false;
        });
    }

    @action
    configBiometrics(isEnable: boolean) {
        if (isEnable) {
            //Do not allow biometrics to be enabled if permissions are not given/locked by OS
            if (!this.isBioSystemReady) {
                return;
            }
            AsyncStorage.setItem(Keys.BIO_ENABLED, JSON.stringify(true));
        } else {
            AsyncStorage.setItem(Keys.BIO_ENABLED, JSON.stringify(false));
            this.resetBiometrics();
        }
        runInAction(() => {
            this.isBioEnabledByUser = isEnable;
        });
    }

    async addBiometric(username: string, password: string): Promise<boolean> {
        if (this.biometryType == null) {
            return false;
        }

        if (this.isBioEnabledByUser) {
            let isPermissionGranted: boolean = false;
            let isBiometricSupported: boolean = true;

            if (this.checkPermissionNeeded()) {
                const permission = await this.checkPermission();
                switch (permission) {
                    case RESULTS.DENIED:
                        const result = await this.requestPermission();
                        switch (result) {
                            case RESULTS.GRANTED:
                                console.log("Permission Granted");
                                isPermissionGranted = true;
                                break;
                            case RESULTS.BLOCKED:
                                console.log(
                                    "The permission is denied and not requestable anymore"
                                );
                                break;
                        }
                        break;
                    case RESULTS.GRANTED:
                        isPermissionGranted = true;
                        break;
                    case RESULTS.BLOCKED:
                        console.log(
                            "The permission is denied and not requestable anymore"
                        );
                        break;
                    default:
                        console.log(
                            "Other permission types encountered: " + permission
                        );
                }
            } else {
                if (
                    this.biometryType == KeyChain.BIOMETRY_TYPE.FACE ||
                    this.biometryType == KeyChain.BIOMETRY_TYPE.IRIS
                ) {
                    isBiometricSupported = false;
                }
                isPermissionGranted = true;
            }
            if (isBiometricSupported && isPermissionGranted) {
                return new Promise((resolve, reject) => {
                    this.addCredentials(resolve, reject, username, password);
                });
            }
        }
        //If it reaches here, it means Biometrics was disabled/not supported
        return false;
    }

    @action
    addCredentials(
        resolve: (isAdded: boolean) => void,
        reject: (reason: string) => void,
        username: string,
        password: string
    ) {
        const isFirstBioSetupDone = this.bioSetupDoneBefore;
        KeyChain.setInternetCredentials(
            Environment.biometricStoreId,
            username,
            password,
            {
                accessControl: KeyChain.ACCESS_CONTROL.BIOMETRY_ANY,
                accessible: KeyChain.ACCESSIBLE.WHEN_UNLOCKED,
            }
        )
            .then(() => {
                if (!isFirstBioSetupDone) {
                    this._isFirstBioSetup = true;
                    AsyncStorage.setItem(
                        Keys.FIRST_BIO_SETUP_DONE,
                        JSON.stringify(true)
                    );
                    runInAction(() => {
                        this.bioSetupDoneBefore = true;
                    });
                } else {
                    this._isFirstBioSetup = false;
                }
                runInAction(() => {
                    this.isLockedOut = false;
                });
                resolve(true);
            })
            .catch((reason) => {
                console.log("BioStore addCredentials error: " + reason);
                reject(reason);
            });
    }

    @action
    retrieveCredentials(): Promise<boolean | KeyChain.UserCredentials> {
        return new Promise((resolve, reject) => {
            KeyChain.getInternetCredentials(Environment.biometricStoreId, {
                authenticationPrompt: {
                    title: I18n.t("auth.biometrics.auth_prompt"),
                },
            })
                .then((userCred: boolean | KeyChain.UserCredentials) => {
                    resolve(userCred);
                })
                .catch((reason: string) => {
                    console.log(
                        "BioStore retrieveCredentials error: " + reason
                    );
                    runInAction(() => {
                        this.isLockedOut = true;
                    });
                    reject(BIOMETRICS_RETRIEVE_ERROR);
                });
        });
    }

    @action
    async isBiometricEnabledSystem() {
        if (this.biometryType == null) {
            runInAction(() => {
                this.isBioSystemReady = false;
            });
            return;
        }

        let isBioPermGranted: boolean = false;
        if (this.checkPermissionNeeded()) {
            const result = await this.checkPermission();
            if (result == RESULTS.GRANTED) {
                isBioPermGranted = true;
            }
        } else {
            isBioPermGranted = true;
        }
        runInAction(() => {
            this.isBioSystemReady = isBioPermGranted;
        });
    }

    async checkPermission(): Promise<string> {
        if (
            this.biometryType !== null &&
            biometry_permission_map.has(this.biometryType)
        ) {
            const permissionString = biometry_permission_map.get(
                this.biometryType
            );
            if (permissionString !== undefined) {
                return await check(permissionString);
            }
        }
        return "";
    }

    async requestPermission(): Promise<string> {
        if (
            this.biometryType !== null &&
            biometry_permission_map.has(this.biometryType)
        ) {
            const permissionString = biometry_permission_map.get(
                this.biometryType
            );
            if (permissionString !== undefined) {
                return await request(permissionString);
            }
        }
        return "";
    }

    checkPermissionNeeded(): boolean {
        if (
            this.biometryType !== null &&
            biometry_permission_map.has(this.biometryType)
        ) {
            return true;
        }
        return false;
    }
}
