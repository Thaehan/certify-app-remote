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
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { inject, observer } from "mobx-react";
import React, { FC, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Alert,
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import {
    Menu,
    MenuOptions,
    MenuTrigger,
    renderers,
} from "react-native-popup-menu";
import { Spinner } from "../../../shared-components/Spinner";
import { CathyRaisedButton } from "../../../shared-components/cathy/CathyButton";
import { CathyTextField } from "../../../shared-components/cathy/CathyTextField";
import { CognitoSessionStore } from "../../../stores/CognitoSessionStore";
import { AllStores } from "../../../stores/RootStore";
import { useNavigation } from "@react-navigation/native";

interface Props {
    navigation: any;
    sessionStore: CognitoSessionStore;
}

const ProfilePasswordScreen: FC<Props> = inject(({ rootStore }: AllStores) => ({
    sessionStore: rootStore.cognitoSessionStore,
}))(
    observer(({ sessionStore }) => {
        const [isFetching, setIsFetching] = useState(false);
        const [hasUpperCase, setHasUpperCase] = useState(false);
        const [hasLowerCase, setHasLowerCase] = useState(false);
        const [hasCharacterLimit, setHasCharacterLimit] = useState(false);
        const [hasSymbol, setHasSymbol] = useState(false);
        const [hasNumber, setHasNumber] = useState(false);
        const [visible, setVisible] = useState(false);
        const [matchVisible, setMatchVisible] = useState(false);

        const oldPasswordInput = useRef<TextInput>(null);
        const newPasswordInput = useRef<TextInput>(null);
        const confirmPasswordInput = useRef<TextInput>(null);

        const oldPasswordRef = useRef("");
        const newPasswordRef = useRef("");
        const confirmPasswordRef = useRef("");

        const { t } = useTranslation();
        const navigation = useNavigation<any>();

        useEffect(() => {
            navigation.setOptions({
                title: t("profile.item.password"),
            });
        }, []);

        useEffect(() => {
            const keyboardDidHideListener = Keyboard.addListener(
                "keyboardDidHide",
                () => {
                    setVisible(false);
                }
            );

            return () => {
                keyboardDidHideListener.remove();
            };
        }, []);

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

        const checkStringBool = (password: string): boolean => {
            return (
                /[A-Z]/.test(password) &&
                /[a-z]/.test(password) &&
                /[$&+,:;=?@#|'<>.^*()%!-]/.test(password) &&
                /[0-9]/.test(password) &&
                password.length >= 8
            );
        };

        const checkString = (password: string): void => {
            let hasUpper = false;
            let hasLower = false;
            let hasSymbol = false;
            let hasLimit = false;
            let hasNum = false;

            for (let i = 0; i < password.length; i++) {
                let c = password.charAt(i);
                if (/[A-Z]/.test(c)) hasUpper = true;
                if (/[a-z]/.test(c)) hasLower = true;
                if (/[$&+,:;=?@#|'<>.^*()%!-]/.test(c)) hasSymbol = true;
                if (/[0-9]/.test(c)) hasNum = true;
            }
            if (password.length >= 8) hasLimit = true;

            setHasUpperCase(hasUpper);
            setHasLowerCase(hasLower);
            setHasSymbol(hasSymbol);
            setHasNumber(hasNum);
            setHasCharacterLimit(hasLimit);
        };

        const onChangeOldPassword = (text: string): void => {
            oldPasswordRef.current = text;
            if (
                text &&
                newPasswordRef.current === confirmPasswordRef.current &&
                newPasswordRef.current.length > 0
            ) {
                setMatchVisible(true);
            } else {
                setMatchVisible(false);
            }
        };

        const onChangeNewPassword = (text: string): void => {
            newPasswordRef.current = text;
            if (!visible && newPasswordInput.current?.isFocused()) {
                setVisible(true);
            }
            checkString(text);
            if (checkStringBool(text)) {
                if (
                    text === confirmPasswordRef.current &&
                    oldPasswordRef.current
                ) {
                    setMatchVisible(true);
                } else {
                    setMatchVisible(false);
                }
                setVisible(false);
            }
        };

        const onChangeConfirmPassword = (text: string): void => {
            confirmPasswordRef.current = text;
            if (text === newPasswordRef.current && oldPasswordRef.current) {
                setMatchVisible(true);
            } else {
                setMatchVisible(false);
            }
        };

        const onSubmitOldPassword = (): void => {
            newPasswordInput.current?.focus();
        };

        const onSubmitNewPassword = (): void => {
            confirmPasswordInput.current?.focus();
        };

        const onSubmitConfirmPassword = (): void => {
            onPressUpdate();
        };

        const changePasswordSuccess = (): void => {
            if (oldPasswordInput.current) oldPasswordInput.current.clear();
            if (newPasswordInput.current) newPasswordInput.current.clear();
            if (confirmPasswordInput.current)
                confirmPasswordInput.current.clear();

            setTimeout(() => {
                Alert.alert(
                    t("alert.title.success"),
                    t("alert.password_success"),
                    [
                        {
                            text: t("alert.button.ok"),
                            onPress: () => {
                                navigation.navigate("Main/Profile");
                            },
                            style: "cancel",
                        },
                    ],
                    { cancelable: false }
                );
            }, 100);
        };

        const onPressUpdate = (): void => {
            Keyboard.dismiss();
            if (!oldPasswordRef.current) {
                showAlert(
                    t("alert.title.missing"),
                    t("alert.missing_old_password")
                );
                return;
            }
            if (!newPasswordRef.current || !confirmPasswordRef.current) {
                showAlert(
                    t("alert.title.missing"),
                    t("alert.missing_password")
                );
                return;
            }
            if (newPasswordRef.current !== confirmPasswordRef.current) {
                showAlert(t("alert.title.error"), t("alert.password_match"));
                return;
            }
            setIsFetching(true);
            sessionStore
                .changePassword(oldPasswordRef.current, newPasswordRef.current)
                .then((result) => {
                    setIsFetching(false);
                    if (result === "SUCCESS") {
                        changePasswordSuccess();
                    }
                })
                .catch((err) => {
                    setIsFetching(false);
                    showAlert(t("alert.title.error"), err);
                });
        };

        const { Popover } = renderers;

        return (
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <KeyboardAvoidingView
                    style={styles.keyboardAvoidingContainer}
                    behavior={"padding"}
                    keyboardVerticalOffset={80}
                >
                    <Spinner isVisible={isFetching} />
                    <View style={styles.topSpace} />
                    <CathyTextField
                        iconSource={require("../../../assets/image/icon/lock.png")}
                        password={true}
                    >
                        <TextInput
                            ref={oldPasswordInput}
                            placeholder={t("placeholder.old_password")}
                            returnKeyType={"next"}
                            onSubmitEditing={onSubmitOldPassword}
                            onChangeText={onChangeOldPassword}
                        />
                    </CathyTextField>
                    <View style={styles.middleSpace1} />
                    <Menu
                        name={"newPassword"}
                        renderer={Popover}
                        rendererProps={{ preferredPlacement: "top" }}
                        opened={visible}
                        onBackdropPress={() => setVisible(false)}
                    >
                        <MenuTrigger>
                            <CathyTextField
                                iconSource={require("../../../assets/image/icon/lock.png")}
                                password={true}
                            >
                                <TextInput
                                    ref={newPasswordInput}
                                    placeholder={t("placeholder.new_password")}
                                    returnKeyType={"next"}
                                    onSubmitEditing={onSubmitNewPassword}
                                    onChangeText={onChangeNewPassword}
                                />
                            </CathyTextField>
                        </MenuTrigger>
                        <MenuOptions
                            optionsContainerStyle={styles.tooltipTextPad}
                        >
                            <Text>
                                <FontAwesomeIcon
                                    style={
                                        hasCharacterLimit
                                            ? styles.greenCheck
                                            : styles.redCross
                                    }
                                    icon={hasCharacterLimit ? faCheck : faTimes}
                                />{" "}
                                {t("auth.eight_characters_long")}
                                <FontAwesomeIcon
                                    style={
                                        hasUpperCase
                                            ? styles.greenCheck
                                            : styles.redCross
                                    }
                                    icon={hasUpperCase ? faCheck : faTimes}
                                />{" "}
                                {t("auth.upper_case")}
                                <FontAwesomeIcon
                                    style={
                                        hasLowerCase
                                            ? styles.greenCheck
                                            : styles.redCross
                                    }
                                    icon={hasLowerCase ? faCheck : faTimes}
                                />{" "}
                                {t("auth.lower_case")}
                                <FontAwesomeIcon
                                    style={
                                        hasSymbol
                                            ? styles.greenCheck
                                            : styles.redCross
                                    }
                                    icon={hasSymbol ? faCheck : faTimes}
                                />{" "}
                                {t("auth.special_symbol")}
                                <FontAwesomeIcon
                                    style={
                                        hasNumber
                                            ? styles.greenCheck
                                            : styles.redCross
                                    }
                                    icon={hasNumber ? faCheck : faTimes}
                                />{" "}
                                {t("auth.number")}
                            </Text>
                        </MenuOptions>
                    </Menu>
                    <View style={styles.middleSpace2} />
                    <CathyTextField
                        iconSource={require("../../../assets/image/icon/lock.png")}
                        password={true}
                    >
                        <TextInput
                            ref={confirmPasswordInput}
                            placeholder={t("placeholder.confirm_password")}
                            returnKeyType={"send"}
                            onSubmitEditing={onSubmitConfirmPassword}
                            onChangeText={onChangeConfirmPassword}
                        />
                    </CathyTextField>
                    <View style={styles.middleSpace3} />
                    <CathyRaisedButton
                        disabled={!matchVisible}
                        text={t("auth.login.update_button")}
                        onPress={onPressUpdate}
                    />
                    <View style={styles.bottomSpace} />
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        );
    })
);

const screenHeight = Dimensions.get("screen").height;
const styles = StyleSheet.create({
    keyboardAvoidingContainer: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "whitesmoke",
    },
    topSpace: {
        height: (64 * (screenHeight - 296)) / 435,
    },
    middleSpace1: {
        height: (36 * (screenHeight - 296)) / 435,
    },
    middleSpace2: {
        height: (24 * (screenHeight - 296)) / 435,
    },
    middleSpace3: {
        height: (48 * (screenHeight - 296)) / 435,
    },
    bottomSpace: {
        flex: 1, // 263
    },
    tooltipTextPad: {
        paddingTop: 10,
        paddingLeft: 15,
        paddingRight: 15,
    },
    greenCheck: {
        color: "green",
    },
    redCross: {
        color: "red",
    },
});

export { ProfilePasswordScreen };
