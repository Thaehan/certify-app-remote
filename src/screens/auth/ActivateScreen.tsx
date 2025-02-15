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
import React, { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Alert,
    Dimensions,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    StyleSheet,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { Select } from "../../shared-components/Select";
import { Spinner } from "../../shared-components/Spinner";
import { CathyRaisedButton } from "../../shared-components/cathy/CathyButton";
import { CathyTextField } from "../../shared-components/cathy/CathyTextField";
import { cathyViews } from "../../shared-components/cathy/CommonViews";
import { SafeAreaFix, TextFix } from "../../shared-components/cathy/IOSFix";
import { ForgotPasswordStore } from "../../stores/ForgotPasswordStore";
import { AllStores } from "../../stores/RootStore";
import { UserPoolStore } from "../../stores/UserPoolStore";
import { Colors } from "../../utils/Colors";
import { ALL_ISO_CODES } from "../../utils/Constants";

interface Props {
    navigation: any;
    userPoolStore: UserPoolStore;
    forgotPasswordStore: ForgotPasswordStore;
}

/**
 * Component for account activation
 *
 * @author Lingqi
 */
const ActivateScreen: FC<Props> = inject(({ rootStore }: AllStores) => ({
    userPoolStore: rootStore.userPoolStore,
    forgotPasswordStore: rootStore.forgotPasswordStore,
}))(
    observer(({ navigation, userPoolStore, forgotPasswordStore }) => {
        const [isoCode, setIsoCode] = useState(
            ALL_ISO_CODES[userPoolStore.accountId][0]
        );
        const [isFetching, setIsFetching] = useState(false);
        const [username, setUsername] = useState("");
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

        const onPressActivate = (): void => {
            Keyboard.dismiss();
            if (!username) {
                showAlert(t("alert.title.missing"), t("alert.missing_id"));
                return;
            }
            setIsFetching(true);
            const fullName = isoCode.trim() + username;
            forgotPasswordStore
                .activate(fullName)
                .then((email) => {
                    setIsFetching(false);
                    activateSuccess(email);
                })
                .catch((reason) => {
                    setIsFetching(false);
                    showAlert(t("alert.title.error"), reason);
                });
        };

        const onSubmitUsername = (): void => {
            onPressActivate();
        };

        const onPickerValueChange = (itemValue: string): void => {
            setIsoCode(itemValue);
        };

        return (
            <SafeAreaFix
                statusBarColor={Colors.cathyBlueBg}
                containerColor={"white"}
            >
                <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                    <KeyboardAvoidingView
                        style={styles.keyboardAvoidingContainer}
                        behavior={"padding"}
                        keyboardVerticalOffset={20}
                    >
                        <LinearGradient
                            style={StyleSheet.absoluteFill}
                            colors={[Colors.cathyBlueBg, "white"]}
                        />
                        <Spinner isVisible={isFetching} />
                        <View style={styles.topSpace} />
                        <Image
                            style={styles.resetImage}
                            source={require("../../assets/image/auth/email.png")}
                            resizeMode={"contain"}
                        />
                        <View style={styles.middleSpace1} />
                        <TextFix style={cathyViews.title}>
                            {t("auth.menu.activate")}
                        </TextFix>
                        <TextFix style={[cathyViews.subtitle, styles.subtitle]}>
                            {t("auth.forgot.initial_subtitle")}
                        </TextFix>
                        <View style={styles.middleSpace2} />
                        <View style={cathyViews.usernameContainer}>
                            <Select
                                style={cathyViews.userCodeSelect}
                                triggerValue={isoCode}
                                triggerTextStyle={
                                    cathyViews.userCodeTriggerText
                                }
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
                                iconSource={require("../../assets/image/icon/identity.png")}
                            >
                                <TextInput
                                    keyboardType={
                                        isoCode === "SG" ? "numeric" : "default"
                                    }
                                    placeholder={"STAFF ID"}
                                    returnKeyType={"done"}
                                    onSubmitEditing={onSubmitUsername}
                                    onChangeText={onChangeUsername}
                                />
                            </CathyTextField>
                        </View>
                        <View style={styles.middleSpace3} />
                        <CathyRaisedButton
                            text={t("auth.activate.activate_button")}
                            onPress={onPressActivate}
                        />
                        <View style={styles.bottomSpace} />
                        <Image
                            style={cathyViews.bottomLogo}
                            source={require("../../assets/image/logo.png")}
                        />
                    </KeyboardAvoidingView>
                </TouchableWithoutFeedback>
            </SafeAreaFix>
        );
    })
);

const screenHeight = Dimensions.get("screen").height;
const styles = StyleSheet.create({
    keyboardAvoidingContainer: {
        flex: 1,
        justifyContent: "flex-end",
    },
    topSpace: {
        height: (100 * (screenHeight - 272)) / 459,
    },
    resetImage: {
        alignSelf: "center",
        width: 88,
        height: 88,
    },
    middleSpace1: {
        height: (28 * (screenHeight - 272)) / 459,
        minHeight: 16,
    },
    subtitle: {
        marginTop: 8,
    },
    middleSpace2: {
        height: (64 * (screenHeight - 272)) / 459,
    },
    middleSpace3: {
        height: (48 * (screenHeight - 272)) / 459,
    },
    bottomSpace: {
        flex: 1, // 219
    },
});

export { ActivateScreen };
