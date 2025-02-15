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
import I18n from 'i18n-js';
import { Locale } from 'react-native-localize';

const translationGetters = {
    'en': () => require('../assets/locale/en.json'),
    'zh-hant': () => require('../assets/locale/zh-hant.json'),
    'zh-hans': () => require('../assets/locale/zh-hans.json'),
};

I18n.translations = {
    'en': translationGetters['en'](),
    'zh-hant': translationGetters['zh-hant'](),
    'zh-hans': translationGetters['zh-hans'](),
};

I18n.defaultLocale = 'en';
I18n.fallbacks = true;

declare module 'i18n-js' {
    function matchedSystemLang(locales: Locale[]): string;
    function toErrorMessage(message: string): string;
}

I18n.matchedSystemLang = (locales) => {
    for (const locale of locales) {
        const systemLang = parseSystemLang(locale.languageTag.toLowerCase());
        if (systemLang.match(/en|zh-hant|zh-hans/)) {
            return systemLang;
        }
    }
    return 'en';
};

function parseSystemLang(systemLang: string): string {
    let lang: string;
    if (systemLang.includes('zh')) {
        switch (systemLang) {
            case 'zh-cn':
            case 'zh-sg':
                lang = 'zh-hans';
                break;
            case 'zh-tw':
            case 'zh-hk':
            case 'zh-mo':
                lang = 'zh-hant';
                break;
            default:
                lang = systemLang.substring(0, 7);
                break;
        }
    } else {
        lang = systemLang.substring(0, 2);
    }
    return lang;
}

I18n.toErrorMessage = (message) => {
    if (!message) {
        message = '';
    }
    const key = message.replace(/\s+/g, '_').replace(/\./g, '');
    return I18n.t('error.' + key);
};

I18n.missingTranslation = (scope, options): string => {
    let errorMsg = '';
    if (scope) {
        errorMsg = scope.split(".").slice(-1)[0];
        errorMsg = "(" + errorMsg + ")";
    }
    return I18n.t('error.translation_na', { errorMsg: errorMsg });
};

export {
    I18n
};
