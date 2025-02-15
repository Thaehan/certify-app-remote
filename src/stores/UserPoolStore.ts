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
import AsyncStorage from '@react-native-async-storage/async-storage';

import { CognitoUserPool, CognitoUser } from 'amazon-cognito-identity-js';
import { BuildVariant } from '../nativeUtils/NativeModules';
import { Environment } from '../utils/Environment';
import { Keys } from '../utils/Constants';
import { RootStore } from './RootStore';
import { action, observable, runInAction } from 'mobx';

/**
 * Service handle cognito user pool
 *
 * @author Lingqi
 */
export class UserPoolStore {

    private rootStore: RootStore;
    private userPool!: CognitoUserPool;
    private currentUser!: CognitoUser;
    private _accountId!: string;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
        if (BuildVariant.buildType === 'debug') {
            // this.userPool = new CognitoUserPool({
            //     UserPoolId: Environment.userPoolId,
            //     ClientId: Environment.clientId,
            // });
        }
    }

    get userPoolId(): string {
        return this.userPool.getUserPoolId();
    }

    get accountId(): string {
        return this._accountId;
    }

    isUserPoolInited(): boolean {
        return this.userPool ? true : false;
    }
    @action
    initUserPool(userPoolId: string, clientId: string, accountId: string): void {
        AsyncStorage.multiSet([
            [Keys.POOL_ID, userPoolId],
            [Keys.CLIENT_ID, clientId],
            [Keys.ACCOUNT_ID, accountId]
        ]);
        this.userPool = new CognitoUserPool({
            UserPoolId: userPoolId,
            ClientId: clientId,
        });
        this._accountId = accountId;
    }
    @action
    loadCachedUserPool(): Promise<boolean> {
        return new Promise((resolve) => {
            if (this.userPool) {
                resolve(true);
                return;
            }
            AsyncStorage.multiGet([
                Keys.POOL_ID,
                Keys.CLIENT_ID,
                Keys.ACCOUNT_ID,
            ]).then((map) => {
                const userPoolId = map[0][1];
                const clientId = map[1][1];
                const accountId = map[2][1];
                if (userPoolId && clientId) {
                    this.userPool = new CognitoUserPool({
                        UserPoolId: userPoolId,
                        ClientId: clientId,
                    });
                    this._accountId = accountId;
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }
    @action
    clearCachedUserPool(): void {
        this.userPool = undefined as any;
        this._accountId = '';
        AsyncStorage.multiRemove([
            Keys.POOL_ID,
            Keys.CLIENT_ID,
            Keys.ACCOUNT_ID,
        ]);
    }
    @action
    createCognitoUser(username: string): CognitoUser {
        const cognitoUser = new CognitoUser({
            Username: username,
            Pool: this.userPool,
        });
        this.currentUser = cognitoUser;
        return cognitoUser;
    }
    @action
    getCurrentUser(): Promise<CognitoUser | undefined> {
        return new Promise((resolve) => {
            if (this.currentUser) {
                resolve(this.currentUser);
                return;
            }
            (this.userPool as any).storage.sync((err?: Error, result?: 'SUCCESS') => {
                if (result === 'SUCCESS') {
                    const currentUser = this.userPool.getCurrentUser();
                    if (currentUser) {
                        resolve(currentUser);
                        return;
                    }
                }
                resolve(undefined);
            });
        });
    }
}
