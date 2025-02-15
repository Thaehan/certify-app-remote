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

/* Staff ID prefixes */
export const ALL_ISO_CODES: { [key: string]: string[] } = {
    'AmA6MHV2ncdDC7K7Hs85vECFfScFbWdZ': ['SG', 'EX', ' '],
    'avDpcwAhQ2obJ7rTj8lica4k9Q2275gf': ['SG', 'EX', ' '],
    'eStgDWxTA2zs7NuJPDxNsJCMYqm3BNkF': ['SG', 'EX', ' '],
    'MwbWxgMt5MWd4XaAWRfBYB4ebE7gBeXx': ['HK', ' '],
    '3vzB8v3mmyME9TVN2NsnSvtKjvHxsMBK': ['HK', ' '],
    'kkA6sns2ncdEW7K8Ws85vEaFfScFbudR': ['AU', ' '],
    'AHwJ6PSukt3SezbBmafZpfPxZV7tRg': ['AU', ' ']
};

/* Account Name */
export const ACCOUNT_NAMES: { [key: string]: string } = {
    'AmA6MHV2ncdDC7K7Hs85vECFfScFbWdZ': 'Certis SG',
    'avDpcwAhQ2obJ7rTj8lica4k9Q2275gf': 'Certis SG',
    'eStgDWxTA2zs7NuJPDxNsJCMYqm3BNkF': 'Certis SG',
    'MwbWxgMt5MWd4XaAWRfBYB4ebE7gBeXx': 'Certis HK',
    '3vzB8v3mmyME9TVN2NsnSvtKjvHxsMBK': 'Certis HK',
    'kkA6sns2ncdEW7K8Ws85vEaFfScFbudR': 'Certis AU',
    'AHwJ6PSukt3SezbBmafZpfPxZV7tRg': 'Certis AU'
};

/* Locales */
export const ALL_LANGUAGES = [
    'en',
    'zh-hant',
    'zh-hans',
];
export const LANGUAGE_MAP: { [key: string]: string } = {
    'en': 'English',
    'zh-hant': '繁體中文',
    'zh-hans': '简体中文',
};

/* Storage Keys */
export const Keys = {
    SYSTEM_LANGUAGE: 'SYSTEM_LANGUAGE',
    LANGUAGE: 'LANGUAGE',
    USERNAME: 'USERNAME',
    POOL_ID: 'POOL_ID',
    CLIENT_ID: 'CLIENT_ID',
    ACCOUNT_ID: 'ACCOUNT_ID',
    INTRO_DONE: 'INTRO_DONE',
    APP_LAYOUT: 'APP_LAYOUT',
    BIO_ENABLED: 'BIO_ENABLED',
    FIRST_BIO_SETUP_DONE: 'FIRST_BIO_SETUP_DONE',
    SAVED_BIO_TYPE: 'SAVED_BIO_TYPE'
};

export const AppVersion = {
    version: '4.0',
    build: '20240501'
};

/* External URLs */
export const WEB_URLS = {
    help: 'https://rebrand.ly/certify-help'
};
