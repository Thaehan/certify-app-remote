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
import { BuildVariant } from '../nativeUtils/NativeModules';

let env: {
    sg: {
        accountId: string;
        userPoolId: string;
        clientId: string;
    };
    hk: {
        accountId: string;
        userPoolId: string;
        clientId: string;
    };
    au: {
        accountId: string;
        userPoolId: string;
        clientId: string;
    };
    endPoint: string;
    certifyWeb: string;
    publicKey: string;
    biometricStoreId: string;
};

switch (BuildVariant.buildType) {
    case 'debug':
        env = {
            sg: {
                accountId: 'AmA6MHV2ncdDC7K7Hs85vECFfScFbWdZ',
                userPoolId: 'ap-southeast-1_q9f4F5mYq',
                clientId: '17d02r79epnu35u2kl56apcg8l',
                // accountId: 'kMbV+N65kU6+9ZL730Qd1E1RqQzLkQsh',
                // userPoolId: 'ap-southeast-1_f7OaA7o1m',
                // clientId: '6cb8187jf9fahnvdr8l7omdo5g',
            },
            hk: {
                accountId: 'MwbWxgMt5MWd4XaAWRfBYB4ebE7gBeXx',
                userPoolId: 'ap-southeast-1_LkSbpgxjx',
                clientId: '3ptbep6o1ls32609mce2o205ro',
            },
            au: {
                accountId: 'kkA6sns2ncdEW7K8Ws85vEaFfScFbudR',
                userPoolId: 'ap-southeast-1_8191RKx6l',
                clientId: '66to5stn7td8aedea8bnjnnnvj',
            },
            endPoint: 'https://auth.certify.run',
            certifyWeb: 'https://app.certify.run',
            publicKey: `-----BEGIN PUBLIC KEY-----
                        MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC7rHwHlVDq1L6UZ+HOYPA4eyhm
                        97Ww5XfvlIkc++0XXXzEm5oi2dPNYUPwsG0VuDRVCK9m4H6SHwYexZouaLvtkoLU
                        UwV740gS9z91UyOft+oQodnM3sYrrqwsDZIy4uCcjpuHu1EU1yqQmcCmVZ0TLmpd
                        EwNXUArWZ6NQxthkkQIDAQAB
                        -----END PUBLIC KEY-----`,
            biometricStoreId: 'certify-debug',
        };
        break;
    case 'staging':
        env = {
            sg: {
                accountId: 'avDpcwAhQ2obJ7rTj8lica4k9Q2275gf',
                userPoolId: 'ap-southeast-1_bbe9csnbP',
                clientId: '45vcodbalukf601nui73lrv9qe',
            },
            hk: {
                accountId: 'MwbWxgMt5MWd4XaAWRfBYB4ebE7gBeXx',
                userPoolId: 'ap-southeast-1_LkSbpgxjx',
                clientId: '3ptbep6o1ls32609mce2o205ro',
            },
            au: {
                accountId: 'kkA6sns2ncdEW7K8Ws85vEaFfScFbudR',
                // userPoolId: 'ap-southeast-1_8191RKx6l',
                // clientId: '66to5stn7td8aedea8bnjnnnvj',
                userPoolId: 'ap-southeast-2_XTKmd1fG6',
                clientId: '7olopf42fhsn805qmvojvf33ms'
            },
            endPoint: 'https://auth.certify.im',
            certifyWeb: 'https://app.certify.im',
            publicKey: `-----BEGIN PUBLIC KEY-----
                        MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQComC5Rn+GjzKcJLyQpsm5nw97g
                        qrXoVwF7ouSpp8HcTJBYXxZ4e5bv9uNQE3xBUFpbACaoc1SkNIbRXzPAsNMGPUI+
                        TYOBZRGDGXX23Ht8h6TpT23xthhhkfBqHrfMOkcNBMsMFPtt7PUt1hkYbhchNT7g
                        aXB3d1yBlpPNusWLSQIDAQAB
                        -----END PUBLIC KEY-----`,
            biometricStoreId: 'certify-staging',
        };
        break;
    case 'release':
        env = {
            sg: {
                accountId: 'eStgDWxTA2zs7NuJPDxNsJCMYqm3BNkF',
                userPoolId: 'ap-southeast-1_Q5BSv9IX7',
                clientId: '5saskarf0kfdai99nr7eaqitf0',
            },
            hk: {
                accountId: '3vzB8v3mmyME9TVN2NsnSvtKjvHxsMBK',
                userPoolId: 'ap-southeast-1_x8dsXiNl1',
                clientId: '797s2lijsafo8tv7a6eif06tvv',
            },
            au: {
                accountId: 'AHwJ6PSukt3SezbBmafZpfPxZV7tRg',
                userPoolId: 'ap-southeast-2_9pnC8wJl4',
                clientId: '261acpc81cvv71hj4qnbnotb47',
            },
            endPoint: 'https://auth.certify.to',
            certifyWeb: 'https://app.certify.to',
            publicKey: `-----BEGIN PUBLIC KEY-----
                        MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDV7Hvo0bIIqTSSMBNKwpSM3woO
                        xybv47iJCxUZuH06LeG5lKk8CdswU4lRPItE7d+OIXgvE0IlZtrjC2Jiej0Z6t+s
                        eL8JdMs4X562E76KnFv7jyKrj62DAVSy8yTumIK/OK+6xFesh2eqEBV4byOL3Ga8
                        rZU+surGGke+r8ojSQIDAQAB
                        -----END PUBLIC KEY-----`,
            biometricStoreId: 'certify'
        };
        break;
}

export const Environment = env!;
