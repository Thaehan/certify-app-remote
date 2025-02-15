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
import {
    observable,
    action,
    runInAction,
} from 'mobx';
import { CognitoUser } from 'amazon-cognito-identity-js';
import { Crypto } from '../nativeUtils/Crypto';
import { I18n } from '../utils/I18n';
import { HttpClient } from '../utils/HttpClient';
import { Environment } from '../utils/Environment';
import { RootStore } from './RootStore';

type UserStatus = 'NO_EMAIL' | 'EMAIL_NOT_VERIFIED' | 'FORCE_CHANGE_PASSWORD' | 'CONFIRMED';
export type Step = 'Initial' | 'Verify' | 'Success';

/**
 * Service handle cognito forgot password flow and activation
 *
 * @author Lingqi
 */
export class ForgotPasswordStore {

    private rootStore: RootStore;
    private cognitoUser!: CognitoUser;

    @observable step: Step;
    @observable isFetching: boolean;
    @observable emptyPassword: boolean;

    private _verifyDetail: VerifyDetail;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
        this.step = 'Initial';
        this.emptyPassword = true;
        this.isFetching = false;
        this._verifyDetail = {
            type: 'email',
            value: 'username@email.com'
        };
    }

    get verifyDetail(): VerifyDetail {
        return this._verifyDetail;
    }

    @action
    checkStatus(username: string): Promise<UserStatus> {
        this.isFetching = true;
        return new Promise((resolve, reject) => {
            const salt = 'wsbCVtBeaKCTCBhHpFeakfbWUdHGwSp';
            const userPoolId = this.rootStore.userPoolStore.userPoolId;
            const dataBytes = this.encode(salt + userPoolId + username);
            Crypto.digest('SHA-1', dataBytes).then((digestBytes) => {
                const signature = this.bytesToHex(digestBytes);
                const url = Environment.endPoint + `/user/status/${userPoolId}/${username}`;
                const params = { s: signature };
                HttpClient.get<StatusResponse>(url, { params })
                    .then((response) => {
                        runInAction(() => {
                            this.isFetching = false;
                            resolve(response.status);
                        });
                    })
                    .catch((reason) => {
                        runInAction(() => {
                            this.isFetching = false;
                            reject(I18n.toErrorMessage(reason));
                        });
                    });
            }).catch((error: Error) => {
                runInAction(() => {
                    this.isFetching = false;
                    reject(I18n.toErrorMessage(error.message));
                });
            });
        });
    }

    @action
    forgotPassword(username: string): Promise<undefined> {
        this.isFetching = true;
        return new Promise((resolve, reject) => {
            this.cognitoUser = this.rootStore.userPoolStore.createCognitoUser(username);
            this.cognitoUser.forgotPassword({
                onSuccess: () => { },
                onFailure: (err) => {
                    runInAction(() => {
                        this.isFetching = false;
                        reject(I18n.toErrorMessage(err.message));
                    });
                },
                inputVerificationCode: (data) => {
                    this._verifyDetail = {
                        type: data['CodeDeliveryDetails']['AttributeName'],
                        value: data['CodeDeliveryDetails']['Destination']
                    };
                    runInAction(() => {
                        this.isFetching = false;
                        this.step = 'Verify';
                    });
                },
            });
        });
    }

    @action
    resendOTP(): Promise<undefined> {
        this.isFetching = true;
        return new Promise((resolve, reject) => {
            this.cognitoUser.forgotPassword({
                onSuccess: () => { },
                onFailure: (err) => {
                    runInAction(() => {
                        this.isFetching = false;
                        reject(I18n.toErrorMessage(err.message));
                    });
                },
                inputVerificationCode: () => {
                    runInAction(() => {
                        this.isFetching = false;
                    });
                },
            });
        });
    }

    @action
    confirmPassword(verificationCode: string, password: string): Promise<undefined> {
        this.isFetching = true;
        return new Promise((resolve, reject) => {
            this.cognitoUser.confirmPassword(verificationCode, password, {
                onSuccess: () => {
                    runInAction(() => {
                        this.isFetching = false;
                        this.step = 'Success';
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
    emptyPasswordCheck(password: string) {
        runInAction(() => {
            this.emptyPassword = password.length < 1 ;
        })
    }

    @action
    clearStates() {
        this.step = 'Initial';
        this.isFetching = false;
        this.emptyPassword = false;
    }

    activate(username: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const url = Environment.endPoint + '/activate';
            const body = {
                userPoolId: this.rootStore.userPoolStore.userPoolId,
                username
            };
            HttpClient.post<ActivateResponse>(url, { body })
                .then((response) => {
                    resolve(response.email);
                })
                .catch((reason) => {
                    reject(I18n.toErrorMessage(reason));
                });
        });
    }

    private encode(str: string): Uint8Array {
        const bufferView = new Uint8Array(str.length);
        for (let i = 0; i < str.length; i++) {
            bufferView[i] = str.charCodeAt(i);
        }
        return bufferView;
    }

    private bytesToHex(bytes: Uint8Array): string {
        let hex = '';
        for (let i = 0; i < bytes.length; i++) {
            if (bytes[i] < 16 && i >= 0) {
                hex += '0';
            }
            hex += bytes[i].toString(16);
        }
        return hex;
    }
}

export interface VerifyDetail {
    type: 'phone_number' | 'email';
    value: string;
}
interface StatusResponse {
    status: UserStatus;
}
interface ActivateResponse {
    email: string;
}
