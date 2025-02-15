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
import React, { FC, Fragment, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Alert,
    Dimensions,
    Image,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import {
    Menu,
    MenuOptions,
    MenuTrigger,
    renderers,
} from "react-native-popup-menu";
import { CathyRaisedButton } from "../../../shared-components/cathy/CathyButton";
import { CathyTextField } from "../../../shared-components/cathy/CathyTextField";
import { cathyViews } from "../../../shared-components/cathy/CommonViews";
import { TextFix } from "../../../shared-components/cathy/IOSFix";
import { AuthenticateStore } from "../../../stores/AuthenticateStore";
import { AllStores } from "../../../stores/RootStore";

interface Props {
    authenticateStore: AuthenticateStore;
}

/**
 * 'TempPassword' step of login flow
 *
 * @author Lingqi
 */
const LoginTempPasswordScreen: FC<Props> = inject(
    ({ rootStore }: AllStores) => ({
        authenticateStore: rootStore.authenticateStore,
    })
)(
    observer(({ authenticateStore }) => {
        const [passwordValidation, setPasswordValidation] = useState({
            hasUpperCase: false,
            hasLowerCase: false,
            hasCharacterLimit: false,
            hasSymbol: false,
            hasNumber: false,
        });
        const [visible, setVisible] = useState(false);
        const [matchVisible, setMatchVisible] = useState(false);
        const [password, setPassword] = useState("");
        const [confirmPass, setConfirmPass] = useState("");

        const passwordInputRef = useRef<TextInput>(null);
        const confirmInputRef = useRef<TextInput>(null);

        const { t } = useTranslation();

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

        const checkStringBool = (pass: string): boolean => {
            return (
                /[A-Z]/.test(pass) &&
                /[a-z]/.test(pass) &&
                /[$&+,:;=?@#|'<>.^*()%!-]/.test(pass) &&
                /[0-9]/.test(pass) &&
                pass.length >= 8
            );
        };

        const checkString = (pass: string): void => {
            setPasswordValidation({
                hasUpperCase: /[A-Z]/.test(pass),
                hasLowerCase: /[a-z]/.test(pass),
                hasSymbol: /[$&+,:;=?@#|'<>.^*()%!-]/.test(pass),
                hasNumber: /[0-9]/.test(pass),
                hasCharacterLimit: pass.length >= 8,
            });
        };

        const onChangePassword = (text: string): void => {
            authenticateStore.emptyPasswordCheck(text);
            if (!visible && passwordInputRef.current?.isFocused()) {
                setVisible(true);
            }
            checkString(text);
            if (checkStringBool(text)) {
                if (text === confirmPass) {
                    setMatchVisible(true);
                } else {
                    setMatchVisible(false);
                }
                setVisible(false);
            }
            setPassword(text);
        };

        const onChangeConfirmPass = (text: string): void => {
            if (text === password) {
                setMatchVisible(true);
            } else {
                setMatchVisible(false);
            }
            setConfirmPass(text);
        };

        const onSubmitPassword = (): void => {
            confirmInputRef.current?.focus();
        };

        const onSubmitConfirmPass = (): void => {
            onPressUpdate();
        };

        const onPressUpdate = (): void => {
            Keyboard.dismiss();
            if (!password || !confirmPass) {
                showAlert(
                    t("alert.title.missing"),
                    t("alert.missing_password")
                );
                return;
            }
            if (password !== confirmPass) {
                showAlert(t("alert.title.error"), t("alert.password_match"));
                return;
            }
            authenticateStore
                .changeTempPassword(password)
                .catch((err: string) => {
                    showAlert(t("alert.title.error"), err);
                });
        };

        const { Popover } = renderers;

        return (
            <Fragment>
                <View style={styles.topSpace} />
                <Image
                    style={styles.authImage}
                    source={require("../../../assets/image/auth/auth.png")}
                    resizeMode={"contain"}
                />
                <View style={styles.middleSpace1} />
                <TextFix style={cathyViews.title}>
                    {t("profile.item.password")}
                </TextFix>
                <View style={styles.middleSpace2} />
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
                                ref={passwordInputRef}
                                placeholder={t("placeholder.new_password")}
                                returnKeyType={"next"}
                                onSubmitEditing={onSubmitPassword}
                                onChangeText={onChangePassword}
                            />
                        </CathyTextField>
                    </MenuTrigger>
                    <MenuOptions optionsContainerStyle={styles.tooltipTextPad}>
                        <Text>
                            <FontAwesomeIcon
                                style={
                                    passwordValidation.hasCharacterLimit
                                        ? styles.greenCheck
                                        : styles.redCross
                                }
                                icon={
                                    passwordValidation.hasCharacterLimit
                                        ? faCheck
                                        : faTimes
                                }
                            />{" "}
                            {t("auth.eight_characters_long")}
                            <FontAwesomeIcon
                                style={
                                    passwordValidation.hasUpperCase
                                        ? styles.greenCheck
                                        : styles.redCross
                                }
                                icon={
                                    passwordValidation.hasUpperCase
                                        ? faCheck
                                        : faTimes
                                }
                            />{" "}
                            {t("auth.upper_case")}
                            <FontAwesomeIcon
                                style={
                                    passwordValidation.hasLowerCase
                                        ? styles.greenCheck
                                        : styles.redCross
                                }
                                icon={
                                    passwordValidation.hasLowerCase
                                        ? faCheck
                                        : faTimes
                                }
                            />{" "}
                            {t("auth.lower_case")}
                            <FontAwesomeIcon
                                style={
                                    passwordValidation.hasSymbol
                                        ? styles.greenCheck
                                        : styles.redCross
                                }
                                icon={
                                    passwordValidation.hasSymbol
                                        ? faCheck
                                        : faTimes
                                }
                            />{" "}
                            {t("auth.special_symbol")}
                            <FontAwesomeIcon
                                style={
                                    passwordValidation.hasNumber
                                        ? styles.greenCheck
                                        : styles.redCross
                                }
                                icon={
                                    passwordValidation.hasNumber
                                        ? faCheck
                                        : faTimes
                                }
                            />{" "}
                            {t("auth.number")}
                        </Text>
                    </MenuOptions>
                </Menu>
                <View style={styles.middleSpace3} />
                <CathyTextField
                    iconSource={require("../../../assets/image/icon/lock.png")}
                    password={true}
                >
                    <TextInput
                        ref={confirmInputRef}
                        placeholder={t("placeholder.confirm_password")}
                        returnKeyType={"send"}
                        onSubmitEditing={onSubmitConfirmPass}
                        onChangeText={onChangeConfirmPass}
                    />
                </CathyTextField>
                <View style={styles.middleSpace4} />
                <CathyRaisedButton
                    disabled={!matchVisible}
                    text={t("auth.login.update_button")}
                    onPress={onPressUpdate}
                />
                <View style={styles.bottomSpace} />
            </Fragment>
        );
    })
);

const screenHeight = Dimensions.get("screen").height;
const styles = StyleSheet.create({
    topSpace: {
        height: ((screenHeight > 660 ? 84 : 64) * (screenHeight - 312)) / 419,
    },
    authImage: {
        alignSelf: "center",
        width: 96,
        height: 96,
    },
    middleSpace1: {
        height: ((screenHeight > 660 ? 20 : 16) * (screenHeight - 312)) / 419,
        minHeight: 12,
        maxHeight: 24,
    },
    middleSpace2: {
        height: ((screenHeight > 660 ? 32 : 24) * (screenHeight - 312)) / 419,
        minHeight: 20,
    },
    middleSpace3: {
        height: ((screenHeight > 660 ? 20 : 16) * (screenHeight - 312)) / 419,
        minHeight: 12,
        maxHeight: 24,
    },
    middleSpace4: {
        height: (44 * (screenHeight - 312)) / 419,
    },
    bottomSpace: {
        flex: 1, // 219
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

export { LoginTempPasswordScreen };
