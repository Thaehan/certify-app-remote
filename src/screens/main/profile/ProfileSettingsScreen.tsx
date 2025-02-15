import { useNavigation } from "@react-navigation/native";
import { inject, observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { Select } from "../../../shared-components/Select";
import { AllStores, RootStore } from "../../../stores/RootStore";
import { Colors } from "../../../utils/Colors";
import { ALL_LANGUAGES, LANGUAGE_MAP } from "../../../utils/Constants";
import { changeLanguage } from "../../../utils/I18n";

interface Props {
    navigation: any;
    rootStore: RootStore;
}

const ProfileSettingsScreen: React.FC<Props> = inject(
    ({ rootStore }: AllStores) => ({
        rootStore,
    })
)(
    observer(({ rootStore }) => {
        const { t, i18n } = useTranslation();
        const [currentLang, setCurrentLang] = useState(i18n.language);
        const navigation = useNavigation();

        useEffect(() => {
            navigation.setOptions({
                title: t("profile.item.settings"),
            });
        }, [navigation]);

        const onSelectLanguage = (language: string): void => {
            rootStore.useLang(language);
            setCurrentLang(language);
            changeLanguage(language);
        };

        return (
            <View style={styles.container}>
                <Text style={styles.languageLabel}>{"Current Language"}</Text>
                <Select
                    style={styles.languageSelect}
                    triggerTextStyle={styles.languageTriggerText}
                    selectedValue={currentLang}
                    onValueChange={onSelectLanguage}
                >
                    {ALL_LANGUAGES.map((lang, index) => (
                        <Select.Item
                            key={index}
                            label={LANGUAGE_MAP[lang]}
                            value={lang}
                            selectedColor={Colors.cathyBlue}
                        />
                    ))}
                </Select>
            </View>
        );
    })
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "whitesmoke",
    },
    languageLabel: {
        marginTop: 24,
        marginLeft: 36,
        fontSize: 12,
        fontFamily: "Roboto-Regular",
        letterSpacing: 0.4,
        lineHeight: 16,
        color: Colors.helperText,
    },
    languageSelect: {
        marginTop: 4,
        height: 48,
        marginHorizontal: 24,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: Colors.cathyBlueBorder,
        backgroundColor: "white",
    },
    languageTriggerText: {
        color: Colors.cathyMajorText,
    },
});

export { ProfileSettingsScreen };
