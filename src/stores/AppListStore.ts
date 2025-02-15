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
import { HttpClient } from '../utils/HttpClient';
import { Environment } from '../utils/Environment';
import { I18n } from '../utils/I18n';
import { RootStore } from './RootStore';

/**
 * Service handle mobile app list of Certify
 *
 * @author Lingqi
 */
export class AppListStore {

    private rootStore: RootStore;

    private isFetching: boolean;
    @observable appList: MobileApp[];

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
        this.isFetching = false;
        this.appList = [];
    }

    @action
    fetchAppList(): Promise<'SUCCESS'> {
        return new Promise((resolve, reject) => {
            const userPoolStore = this.rootStore.userPoolStore;
            const sessionStore = this.rootStore.cognitoSessionStore;
            if (!sessionStore.currentSession) {
                reject('There is no user session');
                return;
            }
            if (this.isFetching) {
                reject('Duplicate request');
                return;
            }
            this.isFetching = true;
            let url = Environment.endPoint + '/auth/success';
            const body = {
                accountId: userPoolStore.accountId,
                token: sessionStore.currentSession.getIdToken().getJwtToken()
            };
            HttpClient.post(url, { body, withCredentials: true }).then(() => {
                url = Environment.endPoint + '/auth/apps';
                HttpClient.get<AppsResponse>(url, { withCredentials: true })
                    .then((response) => {
                        runInAction(() => {
                            this.appList = response.apps.filter((app) => {
                                if (app.icon) {
                                    app.icon = Environment.certifyWeb + '/apps/icons/' + app.icon;
                                }
                                return app.listed.mobile;
                            });
                            this.isFetching = false;
                            resolve('SUCCESS');
                        });
                    })
                    .catch((reason) => {
                        this.isFetching = false;
                        reject(I18n.toErrorMessage(reason));
                    });
            }).catch((reason) => {
                this.isFetching = false;
                reject(I18n.toErrorMessage(reason));
            });
        });
    }
}

/**
 * Mobile app model
 *
 * @author Lingqi
 */
export interface MobileApp {
    appId: string;
    title: string;
    icon: string;
    desc: string;
    redirectUri: string;
    appType: 'MOBILE' | 'WEB';
    listed: {
        web?: boolean;
        mobile?: boolean;
    };
    downloads: {
        android?: string;
        iOS?: string;
    };
}

interface AppsResponse {
    apps: MobileApp[];
}
