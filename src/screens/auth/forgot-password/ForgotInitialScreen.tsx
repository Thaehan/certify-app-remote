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
import { inject, observer } from "mobx-react";
import React, { FC, Fragment, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Alert,
    Dimensions,
    Image,
    Keyboard,
    StyleSheet,
    TextInput,
    View,
} from "react-native";
import { Select } from "../../../shared-components/Select";
import { CathyRaisedButton } from "../../../shared-components/cathy/CathyButton";
import { CathyTextField } from "../../../shared-components/cathy/CathyTextField";
import { cathyViews } from "../../../shared-components/cathy/CommonViews";
import { TextFix } from "../../../shared-components/cathy/IOSFix";
import { ForgotPasswordStore } from "../../../stores/ForgotPasswordStore";
import { AllStores } from "../../../stores/RootStore";
import { UserPoolStore } from "../../../stores/UserPoolStore";
import { Colors } from "../../../utils/Colors";
import { ALL_ISO_CODES } from "../../../utils/Constants";

interface Props {
    navigation: any;
    userPoolStore: UserPoolStore;
    forgotPasswordStore: ForgotPasswordStore;
}

/**
 * 'Initial' step of forgot-password flow
 *
 * @author Lingqi
 */
const ForgotInitialScreen: FC<Props> = inject(({ rootStore }: AllStores) => ({
    userPoolStore: rootStore.userPoolStore,
    forgotPasswordStore: rootStore.forgotPasswordStore,
}))(
    observer(({ navigation, userPoolStore, forgotPasswordStore }) => {
        const [isoCode, setIsoCode] = useState(
            ALL_ISO_CODES[userPoolStore.accountId][0]
        );
        const [username, setUsername] = useState("");
        const usernameInputRef = useRef<TextInput>(null);
        const { t } = useTranslation();

        const showAlert = (title: string, message: string): void => {
            setTimeout(() => {
                Alert.alert(
                    title,
                    message,
                    [{ text: t("alert.button.ok"), style: "cancel" }],
                    { cancelable: false }
                );
            }, 100);
        };

        const activateSuccess = (email: string): void => {
            setTimeout(() => {
                Alert.alert(
                    t("alert.title.success"),
                    t("alert.activate_success", { email }),
                    [
                        {
                            text: t("alert.button.ok"),
                            onPress: () => {
                                navigation.navigate("Auth/Login");
                            },
                            style: "cancel",
                        },
                    ],
                    { cancelable: false }
                );
            }, 100);
        };

        const onChangeUsername = (text: string): void => {
            setUsername(text);
        };

        const onPressNext = (): void => {
            Keyboard.dismiss();
            if (!username) {
                showAlert(t("alert.title.missing"), t("alert.missing_id"));
                return;
            }
            const fullName = isoCode.trim() + username;
            forgotPasswordStore
                .checkStatus(fullName)
                .then((status) => {
                    switch (status) {
                        case "NO_EMAIL":
                            showAlert(
                                t("alert.title.error"),
                                t("error.no_valid_email")
                            );
                            break;
                        case "EMAIL_NOT_VERIFIED":
                            showAlert(
                                t("alert.title.error"),
                                t("error.no_verified_email")
                            );
                            break;
                        case "FORCE_CHANGE_PASSWORD":
                            forgotPasswordStore
                                .activate(fullName)
                                .then((email) => {
                                    activateSuccess(email);
                                })
                                .catch((reason) => {
                                    showAlert(t("alert.title.error"), reason);
                                });
                            break;
                        case "CONFIRMED":
                            forgotPasswordStore
                                .forgotPassword(fullName)
                                .then()
                                .catch((err: string) => {
                                    showAlert(t("alert.title.error"), err);
                                    usernameInputRef.current?.clear();
                                    setUsername("");
                                });
                            break;
                    }
                })
                .catch((error) => {
                    showAlert(t("alert.title.error"), error);
                });
        };

        const onSubmitUsername = (): void => {
            onPressNext();
        };

        const onPickerValueChange = (itemValue: string): void => {
            setIsoCode(itemValue);
        };

        return (
            <Fragment>
                <View style={styles.topSpace} />
                <Image
                    style={styles.resetImage}
                    source={require("../../../assets/image/auth/email.png")}
                    resizeMode={"contain"}
                />
                <View style={styles.middleSpace1} />
                <TextFix style={cathyViews.title}>
                    {t("auth.forgot.initial_title")}
                </TextFix>
                <TextFix style={[cathyViews.subtitle, styles.subtitle]}>
                    {t("auth.forgot.initial_subtitle")}
                </TextFix>
                <View style={styles.middleSpace2} />
                <View style={cathyViews.usernameContainer}>
                    <Select
                        style={cathyViews.userCodeSelect}
                        triggerValue={isoCode}
                        triggerTextStyle={cathyViews.userCodeTriggerText}
                        selectedValue={isoCode}
                        onValueChange={onPickerValueChange}
                    >
                        {ALL_ISO_CODES[userPoolStore.accountId].map(
                            (code, index) => (
                                <Select.Item
                                    key={index}
                                    label={t("locale." + code)}
                                    value={code}
                                    selectedColor={Colors.cathyBlue}
                                />
                            )
                        )}
                    </Select>
                    <CathyTextField
                        style={cathyViews.usernameField}
                        iconSource={require("../../../assets/image/icon/identity.png")}
                    >
                        <TextInput
                            ref={usernameInputRef}
                            keyboardType={
                                isoCode === "SG" ? "numeric" : "default"
                            }
                            placeholder={t("placeholder.id")}
                            returnKeyType={"done"}
                            onSubmitEditing={onSubmitUsername}
                            onChangeText={onChangeUsername}
                        />
                    </CathyTextField>
                </View>
                <View style={styles.middleSpace3} />
                <CathyRaisedButton
                    text={t("auth.forgot.next_button")}
                    onPress={onPressNext}
                />
                <View style={styles.bottomSpace} />
            </Fragment>
        );
    })
);

const screenHeight = Dimensions.get("screen").height;
const styles = StyleSheet.create({
    topSpace: {
        height: ((screenHeight > 660 ? 100 : 84) * (screenHeight - 272)) / 459,
    },
    resetImage: {
        alignSelf: "center",
        width: 88,
        height: 88,
    },
    middleSpace1: {
        height: ((screenHeight > 660 ? 28 : 24) * (screenHeight - 272)) / 459,
        minHeight: 16,
        maxHeight: 32,
    },
    subtitle: {
        marginTop: 8,
    },
    middleSpace2: {
        height: ((screenHeight > 660 ? 64 : 52) * (screenHeight - 272)) / 459,
    },
    middleSpace3: {
        height: (48 * (screenHeight - 272)) / 459,
    },
    bottomSpace: {
        flex: 1, // 219
    },
});

export { ForgotInitialScreen };
