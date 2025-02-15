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
import { Alert, Image, Linking, StyleSheet, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { Spinner } from "../../shared-components/Spinner";
import {
    CathyRaisedButton,
    CathyTextButton,
} from "../../shared-components/cathy/CathyButton";
import { cathyViews } from "../../shared-components/cathy/CommonViews";
import { SafeAreaFix, TextFix } from "../../shared-components/cathy/IOSFix";
import { CallbackStore } from "../../stores/CallbackStore";
import { CognitoSessionStore } from "../../stores/CognitoSessionStore";
import { AllStores } from "../../stores/RootStore";
import { Colors } from "../../utils/Colors";

interface Props {
    navigation: any;
    sessionStore: CognitoSessionStore;
    callbackStore: CallbackStore;
}

/**
 * Component display single sign on
 *
 * @author Lingqi
 */
const SingleSignOnScreen: FC<Props> = inject(({ rootStore }: AllStores) => ({
    sessionStore: rootStore.cognitoSessionStore,
    callbackStore: rootStore.callbackStore,
}))(
    observer(({ navigation, sessionStore, callbackStore }) => {
        const [isFetching, setIsFetching] = useState(false);
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
        };

        const onPressContinue = (): void => {
            setIsFetching(true);
            callbackStore
                .getOutboundLink()
                .then((redirectUrl) => {
                    setIsFetching(false);
                    openUrl(redirectUrl);
                })
                .catch((reason) => {
                    setIsFetching(false);
                    showAlert(t("alert.title.error"), reason);
                });
        };

        const onPressAnother = (): void => {
            sessionStore.signOut();
            navigation.navigate("Auth/Login");
        };

        return (
            <SafeAreaFix
                statusBarColor={Colors.cathyBlueBg}
                containerColor={"white"}
            >
                <LinearGradient
                    style={styles.container}
                    colors={[Colors.cathyBlueBg, "white"]}
                >
                    <Spinner isVisible={isFetching} />
                    <View style={styles.topSpace} />
                    <Image
                        style={styles.successImage}
                        source={require("../../assets/image/auth/success.png")}
                        resizeMode={"contain"}
                    />
                    <View style={styles.middleSpace1} />
                    <TextFix style={cathyViews.title}>
                        {t("auth.sso.title")}
                    </TextFix>
                    <TextFix style={[cathyViews.subtitle, styles.successInfo]}>
                        {t("auth.sso.subtitle", {
                            name: sessionStore.displayName(),
                        })}
                    </TextFix>
                    <View style={styles.middleSpace2} />
                    <CathyRaisedButton
                        text={t("auth.sso.continue_button", {
                            appName: callbackStore.appName,
                        })}
                        onPress={onPressContinue}
                    />
                    <View style={styles.middleSpace3} />
                    <CathyTextButton
                        text={t("auth.sso.another_button")}
                        onPress={onPressAnother}
                    />
                    <View style={styles.bottomSpace} />
                    <Image
                        style={cathyViews.bottomLogo}
                        source={require("../../assets/image/logo.png")}
                    />
                </LinearGradient>
            </SafeAreaFix>
        );
    })
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topSpace: {
        flex: 92,
    },
    successImage: {
        alignSelf: "center",
        width: 83,
        height: 102,
    },
    middleSpace1: {
        flex: 20,
    },
    successInfo: {
        marginTop: 4,
    },
    middleSpace2: {
        flex: 96,
    },
    middleSpace3: {
        height: 16,
    },
    bottomSpace: {
        flex: 245,
    },
});

export { SingleSignOnScreen };
