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
import React, { FC } from "react";
import { useTranslation } from "react-i18next";
import {
    Alert,
    Dimensions,
    Image,
    Linking,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { CathyRaisedButton } from "../../../shared-components/cathy/CathyButton";
import { AppListStore } from "../../../stores/AppListStore";
import { AuthenticateStore } from "../../../stores/AuthenticateStore";
import { BiometricStore } from "../../../stores/BiometricStore";
import { CallbackStore } from "../../../stores/CallbackStore";
import { CognitoSessionStore } from "../../../stores/CognitoSessionStore";
import { AllStores } from "../../../stores/RootStore";
import { Colors } from "../../../utils/Colors";

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
 * @author NganNH
 */
const SetupMfaSuccessScreen: FC<Props> = inject(({ rootStore }: AllStores) => ({
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

            const onFinish = (): void => {
                appListStore
                    .fetchAppList()
                    .then()
                    .catch((reason) => {
                        console.log(reason);
                    });
                navigation.navigate("Main/Home");
            };

            return (
                <View style={styles.container}>
                    <View style={styles.contentContainer}>
                        <Image
                            style={styles.successImage}
                            source={require("../../../assets/image/icon/setup-mfa-success.png")}
                            resizeMode={"contain"}
                        />
                        <View style={styles.middleSpace1} />
                        <View>
                            <Text style={styles.mainTitle}>
                                {t("auth.mfa.success_title")}
                            </Text>
                        </View>
                        <View>
                            <Text style={styles.subtitle}>
                                {authenticateStore.mfaSetupType === "SMS"
                                    ? t("auth.mfa.mfa_setup_sms_successfully")
                                    : t("auth.mfa.mfa_setup_totp_successfully")}
                            </Text>
                        </View>
                        <View style={styles.bottomSpace} />
                        <View style={styles.submitContainer}>
                            <CathyRaisedButton
                                style={styles.loginButton}
                                text="Finish"
                                onPress={onFinish}
                            />
                        </View>
                    </View>
                </View>
            );
        }
    )
);

const screenHeight = Dimensions.get("screen").height;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
    },
    contentContainer: {
        backgroundColor: "white",
        margin: 20,
        padding: 20,
    },
    topSpace: {
        height: (40 * (screenHeight - 222)) / 509,
    },
    successImage: {
        alignSelf: "center",
        width: 100,
        height: 100,
    },
    middleSpace1: {
        height: (28 * (screenHeight - 222)) / 509,
        minHeight: 16,
    },
    subtitle: {
        marginTop: 8,
        textAlign: "center",
    },
    bottomSpace: {
        flex: 1, // 381
    },
    mainTitle: {
        fontSize: 28,
        fontFamily: "Roboto-Regular",
        lineHeight: 32,
        textAlign: "center",
        color: Colors.cathyMajorText,
    },
    loginButton: {
        flexGrow: 1,
        marginHorizontal: 0,
    },
    submitContainer: {
        marginVertical: 20,
    },
});

export { SetupMfaSuccessScreen };
