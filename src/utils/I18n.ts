import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as RNLocalize from "react-native-localize";

import { storage } from "./mmkvStorage/storage";
//@ts-ignore
import en from "../assets/locale/en.json";
//@ts-ignore
import zhhans from "../assets/locale/zh-hans.json";
//@ts-ignore
import zhhant from "../assets/locale/zh-hant.json";
import { Keys } from "./Constants";

const resources = {
    en: {
        translation: en,
    },
    zh: {
        translation: zhhans,
    },
    "zh-Hans": {
        translation: zhhant,
    },
};

// Lấy ngôn ngữ từ MMKV
export const getStoredLanguage = () => {
    return (
        storage.getString(Keys.LANGUAGE) ||
        RNLocalize.getLocales()[0].languageCode ||
        "en"
    );
};

// Khởi tạo i18n
i18n.use(initReactI18next).init({
    resources,
    lng: getStoredLanguage(),
    fallbackLng: "en",
    interpolation: { escapeValue: false },
});

export const toErrorMessage = (message: string) => {
    if (!message) {
        message = "";
    }
    const key = message.replace(/\s+/g, "_").replace(/\./g, "");
    return i18n.t("error." + key);
};

// Hàm thay đổi ngôn ngữ và lưu vào MMKV
export const changeLanguage = (lang: string) => {
    const convertLang = (newLang: string) => {
        switch (newLang) {
            case "zh-hant":
                return "zh";
            case "zh-hans":
                return "zh-Hans";
            default:
                return newLang;
        }
    };

    storage.set(Keys.LANGUAGE, convertLang(lang));
    i18n.changeLanguage(convertLang(lang));
};

export default { ...i18n, toErrorMessage };
