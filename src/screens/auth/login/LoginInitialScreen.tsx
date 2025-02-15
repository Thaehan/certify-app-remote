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
import { faFingerprint } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { inject, observer } from "mobx-react";
import React, { FC, Fragment, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Alert,
    Dimensions,
    Keyboard,
    StyleSheet,
    TextInput,
    View,
} from "react-native";
import { MaterialButton } from "../../../shared-components/MaterialButton";
import { Select } from "../../../shared-components/Select";
import {
    CathyRaisedButton,
    CathyTextButton,
} from "../../../shared-components/cathy/CathyButton";
import { CathyTextField } from "../../../shared-components/cathy/CathyTextField";
import { cathyViews } from "../../../shared-components/cathy/CommonViews";
import { TextFix } from "../../../shared-components/cathy/IOSFix";
import { AuthenticateStore } from "../../../stores/AuthenticateStore";
import {
    BIOMETRICS_RETRIEVE_ERROR,
    BiometricStore,
} from "../../../stores/BiometricStore";
import { CallbackStore } from "../../../stores/CallbackStore";
import { AllStores } from "../../../stores/RootStore";
import { UserPoolStore } from "../../../stores/UserPoolStore";
import { Colors } from "../../../utils/Colors";
import { ACCOUNT_NAMES, ALL_ISO_CODES, Keys } from "../../../utils/Constants";
import {
    CommonActions,
    useNavigation,
    useRoute,
} from "@react-navigation/native";

interface Props {
    navigation: any;
    userPoolStore: UserPoolStore;
    authenticateStore: AuthenticateStore;
    callbackStore: CallbackStore;
    biometricStore: BiometricStore;
    accountId: string;
}

/**
 * 'Initial' step of login flow
 *
 * @author Lingqi
 */
const LoginInitialScreen: FC<Props> = inject(({ rootStore }: AllStores) => ({
    userPoolStore: rootStore.userPoolStore,
    authenticateStore: rootStore.authenticateStore,
    callbackStore: rootStore.callbackStore,
    biometricStore: rootStore.biometricStore,
}))(
    observer(
        ({
            userPoolStore,
            authenticateStore,
            callbackStore,
            biometricStore,
            accountId,
        }) => {
            const [isoCode, setIsoCode] = useState("");
            const [username, setUsername] = useState("");
            const [password, setPassword] = useState("");
            const [listIsoCode, setListIsoCode] = useState<string[]>([]);

            const usernameInputRef = useRef<TextInput>(null);
            const passwordInputRef = useRef<TextInput>(null);

            const { t } = useTranslation();
            const navigation = useNavigation();
            const route = useRoute<any>();

            useEffect(() => {
                navigation.addListener("focus", onWillFocus);

                if (userPoolStore && userPoolStore.accountId) {
                    setListIsoCode(ALL_ISO_CODES[userPoolStore.accountId]);
                    setIsoCode(ALL_ISO_CODES[userPoolStore.accountId]?.[0]);
                }

                AsyncStorage.getItem(Keys.USERNAME).then((savedUsername) => {
                    if (savedUsername) {
                        setUsername(savedUsername);
                    }
                });

                return () => {
                    navigation.removeListener("focus", onWillFocus);
                };
            }, []);

            useEffect(() => {
                if (accountId?.length) {
                    console.log({ accountId });
                    setListIsoCode(ALL_ISO_CODES[accountId]);
                    setIsoCode(ALL_ISO_CODES?.[accountId]?.[0]);
                }
            }, [accountId]);

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

            const onWillFocus = () => {
                const isSignOut = route.params?.isSignOut;
                if (biometricStore.isBioReady && !isSignOut) {
                    onPressBiometrics();
                }
            };

            const onChangeUsername = (text: string): void => {
                setUsername(text);
            };

            const onChangePassword = (text: string): void => {
                setPassword(text);
            };

            const onSubmitUsername = (): void => {
                passwordInputRef.current?.focus();
            };

            const onSubmitPassword = (): void => {
                onPressLogin();
            };

            const onPressLogin = async (): Promise<void> => {
                Keyboard.dismiss();
                if (!username || !password) {
                    showAlert(
                        t("alert.title.missing"),
                        t("alert.missing_id_password")
                    );
                    return;
                }
                await AsyncStorage.setItem(Keys.USERNAME, username);
                const fullName = isoCode.trim() + username;
                const appId = callbackStore.appId;

                try {
                    await authenticateStore.authenticateUser(
                        fullName,
                        password,
                        appId
                    );
                } catch (err) {
                    showAlert(t("alert.title.error"), err as string);
                    setPassword("");
                }
            };

            const onPressBiometrics = (): void => {
                const appId = callbackStore.appId;
                authenticateStore
                    .authenticateUserBiometrics(appId)
                    .catch((err: string) => {
                        if (err !== BIOMETRICS_RETRIEVE_ERROR) {
                            showAlert(t("alert.title.error"), err);
                        }
                    });
            };

            const onPressForgot = (): void => {
                Keyboard.dismiss();
                navigation.dispatch(CommonActions.navigate("Auth/Forgot"));
            };

            const onPickerValueChange = (itemValue: string): void => {
                setIsoCode(itemValue);
            };

            const isBioButtonDisabled =
                !biometricStore.isBioReady || biometricStore.isLockedOut;

            return (
                <Fragment>
                    <View style={styles.topSpace} />
                    <TextFix style={cathyViews.largeTitle}>
                        {t("auth.login.initial_title")}
                    </TextFix>
                    <TextFix style={[cathyViews.subtitle, styles.subtitle]}>
                        {t("auth.login.initial_subtitle", {
                            appName: callbackStore.sessionId
                                ? callbackStore.appName
                                : ACCOUNT_NAMES[userPoolStore.accountId],
                        })}
                    </TextFix>
                    <View style={styles.middleSpace1} />
                    <View style={cathyViews.usernameContainer}>
                        <Select
                            style={cathyViews.userCodeSelect}
                            triggerValue={isoCode}
                            triggerTextStyle={cathyViews.userCodeTriggerText}
                            selectedValue={isoCode}
                            onValueChange={onPickerValueChange}
                        >
                            {listIsoCode?.map((code, index) => (
                                <Select.Item
                                    key={index}
                                    label={t("locale." + code)}
                                    value={code}
                                    selectedColor={Colors.cathyBlue}
                                />
                            ))}
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
                                value={username}
                                placeholder={t("placeholder.id")}
                                returnKeyType={"done"}
                                onSubmitEditing={onSubmitUsername}
                                onChangeText={onChangeUsername}
                            />
                        </CathyTextField>
                    </View>
                    <View style={styles.middleSpace2} />
                    <CathyTextField
                        iconSource={require("../../../assets/image/icon/lock.png")}
                        password={true}
                    >
                        <TextInput
                            ref={passwordInputRef}
                            value={password}
                            placeholder={t("placeholder.password")}
                            returnKeyType={"send"}
                            onSubmitEditing={onSubmitPassword}
                            onChangeText={onChangePassword}
                        />
                    </CathyTextField>
                    <View style={styles.middleSpace3} />
                    <View style={styles.loginButtonsContainer}>
                        <CathyRaisedButton
                            style={styles.loginButton}
                            text={t("auth.login.login_button")}
                            onPress={onPressLogin}
                        />
                        {biometricStore.bioSetupDoneBefore && (
                            <MaterialButton
                                rippleColor={Colors.blackOverlay}
                                style={[
                                    styles.iconButton,
                                    isBioButtonDisabled
                                        ? styles.iconButtonDisabled
                                        : {},
                                ]}
                                contentStyle={styles.iconButtonContent}
                                onPress={onPressBiometrics}
                                disabled={isBioButtonDisabled}
                            >
                                <FontAwesomeIcon
                                    icon={faFingerprint}
                                    size={28}
                                    style={styles.iconButtonIcon}
                                />
                            </MaterialButton>
                        )}
                    </View>
                    <View style={styles.middleSpace4} />
                    <CathyTextButton
                        text={t("auth.login.forgot_button")}
                        onPress={onPressForgot}
                    />
                    <View style={styles.bottomSpace} />
                </Fragment>
            );
        }
    )
);

const screenHeight = Dimensions.get("screen").height;
const styles = StyleSheet.create({
    topSpace: {
        height: (88 * (screenHeight - 300)) / 431,
    },
    subtitle: {
        marginTop: 8,
    },
    middleSpace1: {
        height: (64 * (screenHeight - 300)) / 431,
    },
    middleSpace2: {
        height: (20 * (screenHeight - 300)) / 431,
        minHeight: 16,
        maxHeight: 24,
    },
    middleSpace3: {
        height: (48 * (screenHeight - 300)) / 431,
    },
    middleSpace4: {
        height: (20 * (screenHeight - 300)) / 431,
        minHeight: 16,
    },
    bottomSpace: {
        flex: 1, // 191
    },
    loginButtonsContainer: {
        flexDirection: "row",
    },
    versionText: {
        textAlign: "center",
        marginBottom: 15,
        fontSize: 12,
        fontFamily: "Roboto-Regular",
        letterSpacing: 0.4,
        lineHeight: 16,
        color: "white",
    },
    iconButton: {
        flexDirection: "row",
        backgroundColor: Colors.cathyOrange,
        marginRight: 24,
        marginLeft: 5,
        height: 48,
        width: 48,
        borderRadius: 4,
    },
    iconButtonDisabled: {
        backgroundColor: Colors.cathyGrey,
    },
    iconButtonContent: {
        margin: 5,
        justifyContent: "center",
        alignItems: "center",
    },
    iconButtonIcon: {
        color: "white",
    },
    loginButton: {
        flexGrow: 1,
    },
});

export { LoginInitialScreen };
