/*
 * Copyright (c) 2019 Certis CISCO Security Pte Ltd
 * All rights reserved.
 *
 * This software is the confidential and proprietary information of
 * Certis CISCO Security Pte Ltd. ("Confidential Information").
 * You shall not disclose such Confidential Information and shall use
 * it only in accordance with the terms of the license agreement you
 * entered into with Certis CISCO Security Pte Ltd.
 */
import {
    configure,
    observable,
    action,
} from 'mobx';
import { I18n } from '../utils/I18n';
import { CallbackStore } from './CallbackStore';
import { UserPoolStore } from './UserPoolStore';
import { AuthenticateStore } from './AuthenticateStore';
import { ForgotPasswordStore } from './ForgotPasswordStore';
import { CognitoSessionStore } from './CognitoSessionStore';
import { BiometricStore } from "./BiometricStore";
import { AppListStore } from './AppListStore';

configure({
    enforceActions: 'observed',
});

export interface AllStores {
    rootStore: RootStore;
}

/**
 * Root store to instantiate all services, and share references of each service
 *
 * @author Lingqi
 */
export class RootStore {

    private _userPoolStore: UserPoolStore;
    private _authenticateStore: AuthenticateStore;
    private _forgotPasswordStore: ForgotPasswordStore;
    private _cognitoSessionStore: CognitoSessionStore;
    private _callbackStore: CallbackStore;
    private _appListStore: AppListStore;
    private _biometricStore: BiometricStore;

    @observable currentLang: string;

    constructor() {
        this._userPoolStore = new UserPoolStore(this);
        this._authenticateStore = new AuthenticateStore(this);
        this._forgotPasswordStore = new ForgotPasswordStore(this);
        this._cognitoSessionStore = new CognitoSessionStore(this);
        this._callbackStore = new CallbackStore(this);
        this._appListStore = new AppListStore(this);
        this._biometricStore = new BiometricStore(this);

        this.currentLang = I18n.currentLocale();
    }

    get userPoolStore(): UserPoolStore {
        return this._userPoolStore;
    }
    get authenticateStore(): AuthenticateStore {
        return this._authenticateStore;
    }
    get forgotPasswordStore(): ForgotPasswordStore {
        return this._forgotPasswordStore;
    }
    get cognitoSessionStore(): CognitoSessionStore {
        return this._cognitoSessionStore;
    }
    get callbackStore(): CallbackStore {
        return this._callbackStore;
    }
    get appListStore(): AppListStore {
        return this._appListStore;
    }
    get biometricStore(): BiometricStore {
        return this._biometricStore;
    }

    @action
    useLang(lang: string) {
        I18n.locale = lang;
        this.currentLang = lang;
    }
}
