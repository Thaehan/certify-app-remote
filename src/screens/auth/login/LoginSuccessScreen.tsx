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
import { inject, observer } from "mobx-react";
import React, { FC, Fragment, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    Alert,
    Dimensions,
    Image,
    Linking,
    StyleSheet,
    View,
} from "react-native";
import { cathyViews } from "../../../shared-components/cathy/CommonViews";
import { TextFix } from "../../../shared-components/cathy/IOSFix";
import { AppListStore } from "../../../stores/AppListStore";
import { AuthenticateStore } from "../../../stores/AuthenticateStore";
import { BiometricStore } from "../../../stores/BiometricStore";
import { CallbackStore } from "../../../stores/CallbackStore";
import { CognitoSessionStore } from "../../../stores/CognitoSessionStore";
import { AllStores } from "../../../stores/RootStore";

interface Props {
    navigation: any;
    sessionStore: CognitoSessionStore;
    callbackStore: CallbackStore;
    appListStore: AppListStore;
    authenticateStore: AuthenticateStore;
    biometricStore: BiometricStore;
}

/**
 * 'Success' step of login flow
 *
 * @author Lingqi
 */
const LoginSuccessScreen: FC<Props> = inject(({ rootStore }: AllStores) => ({
    sessionStore: rootStore.cognitoSessionStore,
    callbackStore: rootStore.callbackStore,
    appListStore: rootStore.appListStore,
    authenticateStore: rootStore.authenticateStore,
    biometricStore: rootStore.biometricStore,
}))(
    observer(
        ({
            navigation,
            sessionStore,
            callbackStore,
            appListStore,
            authenticateStore,
            biometricStore,
        }) => {
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

            const openUrl = (url: string): void => {
                setTimeout(() => {
                    Linking.openURL(url)
                        .then(() => {
                            callbackStore.clearCallback();
                            navigation.navigate("Splash");
                        })
                        .catch(() => {
                            showAlert(
                                t("alert.title.error"),
                                t("error.not_installed", {
                                    appName: callbackStore.appName,
                                })
                            );
                        });
                }, 1000);
            };

            useEffect(() => {
                const handleBiometricsAndNavigation = async () => {
                    const isAdded =
                        await authenticateStore.addBiometricFunctionality();

                    if (biometricStore.isFirstBioSetup) {
                        const bioType = t(
                            `auth.biometrics.${biometricStore.bioLocalisationKey}`
                        );
                        showAlert(
                            t("auth.biometrics.setup_successful_title", {
                                bioType,
                            }),
                            t("auth.biometrics.setup_successful_subtitle", {
                                bioType,
                            })
                        );
                    }

                    if (callbackStore.sessionId) {
                        try {
                            const redirectUrl =
                                await callbackStore.getOutboundLink();
                            openUrl(redirectUrl);
                        } catch (reason) {
                            showAlert(t("alert.title.error"), reason as string);
                        }
                    } else {
                        try {
                            await appListStore.fetchAppList();
                        } catch (reason) {
                            console.log(reason);
                        }
                        navigation.navigate("Main/Home");
                    }
                };

                handleBiometricsAndNavigation();
            }, []);

            return (
                <Fragment>
                    <View style={styles.topSpace} />
                    <Image
                        style={styles.successImage}
                        source={require("../../../assets/image/auth/success.png")}
                        resizeMode={"contain"}
                    />
                    <View style={styles.middleSpace1} />
                    <TextFix style={cathyViews.title}>
                        {t("auth.login.success_title")}
                    </TextFix>
                    <TextFix style={[cathyViews.title, styles.subtitle]}>
                        {t("auth.login.success_subtitle", {
                            name: sessionStore.displayName(),
                        })}
                    </TextFix>
                    {callbackStore.sessionId && (
                        <TextFix
                            style={[cathyViews.subtitle, styles.successInfo]}
                        >
                            {t("auth.login.success_info", {
                                appName: callbackStore.appName,
                            })}
                        </TextFix>
                    )}
                    <View style={styles.bottomSpace} />
                </Fragment>
            );
        }
    )
);

const screenHeight = Dimensions.get("screen").height;
const styles = StyleSheet.create({
    topSpace: {
        height: (100 * (screenHeight - 222)) / 509,
    },
    successImage: {
        alignSelf: "center",
        width: 83,
        height: 102,
    },
    middleSpace1: {
        height: (28 * (screenHeight - 222)) / 509,
        minHeight: 16,
    },
    subtitle: {
        marginTop: 8,
    },
    successInfo: {
        marginTop: 8,
    },
    bottomSpace: {
        flex: 1, // 381
    },
});

export { LoginSuccessScreen };
