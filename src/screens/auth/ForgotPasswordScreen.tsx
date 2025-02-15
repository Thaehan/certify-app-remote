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
import { HeaderBackButton } from "@react-navigation/elements";
import { inject, observer } from "mobx-react";
import React, { FC, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
    Alert,
    BackHandler,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TouchableWithoutFeedback,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { Spinner } from "../../shared-components/Spinner";
import { cathyViews } from "../../shared-components/cathy/CommonViews";
import { SafeAreaFix } from "../../shared-components/cathy/IOSFix";
import { ForgotPasswordStore, Step } from "../../stores/ForgotPasswordStore";
import { AllStores } from "../../stores/RootStore";
import { Colors } from "../../utils/Colors";
import { ForgotInitialScreen } from "./forgot-password/ForgotInitialScreen";
import { ForgotSuccessScreen } from "./forgot-password/ForgotSuccessScreen";
import { ForgotVerifyScreen } from "./forgot-password/ForgotVerifyScreen";
import { useNavigation, useRoute } from "@react-navigation/native";

interface Props {
    navigation: any;
    forgotPasswordStore: ForgotPasswordStore;
}

/**
 * Forgot-password component, contains 3 steps, each step one child component
 *
 * @author Lingqi
 */
const ForgotPasswordScreen: FC<Props> = inject(({ rootStore }: AllStores) => ({
    forgotPasswordStore: rootStore.forgotPasswordStore,
}))(
    observer(({ forgotPasswordStore }) => {
        const previousStepRef = useRef<Step>("Initial");
        const { t } = useTranslation();
        const navigation = useNavigation<any>();
        const route = useRoute<any>();

        const step: Step = route.params?.step;

        const onBackPressed = (): boolean => {
            Keyboard.dismiss();
            switch (forgotPasswordStore.step) {
                case "Initial":
                    navigation.navigate("Auth/Login");
                    return true;
                case "Verify":
                    if (!forgotPasswordStore.emptyPassword) {
                        Alert.alert(
                            t("alert.title.exit"),
                            t("alert.exit_reset"),
                            [
                                {
                                    text: t("alert.button.cancel"),
                                    style: "cancel",
                                },
                                {
                                    text: t("alert.button.exit"),
                                    onPress: () => {
                                        navigation.navigate("Auth/Login");
                                        forgotPasswordStore.clearStates();
                                    },
                                    style: "destructive",
                                },
                            ],
                            { cancelable: false }
                        );
                    } else {
                        navigation.navigate("Auth/Login");
                        forgotPasswordStore.clearStates();
                    }
                    return true;
                case "Success":
                    return true;
            }
            return false;
        };

        useEffect(() => {
            navigation.setParams({ onBackPressed });
            navigation.setOptions({
                headerLeft:
                    step === "Initial" || step === "Verify" ? (
                        <HeaderBackButton
                            // backTitleVisible={Platform.OS === 'ios'}
                            tintColor={
                                Platform.OS === "android"
                                    ? Colors.unfocusedIcon
                                    : Colors.focusedIcon
                            }
                            // pressColorAndroid={Colors.blackOverlay}
                            onPress={onBackPressed}
                        />
                    ) : undefined,
            });
        }, []);

        useEffect(() => {
            forgotPasswordStore.clearStates();
            navigation.setParams({ onBackPressed });

            const willFocusSubs = navigation.addListener("focus", () => {
                BackHandler.addEventListener(
                    "hardwareBackPress",
                    onBackPressed
                );
            });

            const willBlurSubs = navigation.addListener("blur", () => {
                BackHandler.removeEventListener(
                    "hardwareBackPress",
                    onBackPressed
                );
            });

            return () => {
                willFocusSubs?.remove?.();
                willBlurSubs?.remove?.();
                BackHandler.removeEventListener(
                    "hardwareBackPress",
                    onBackPressed
                );
            };
        }, []);

        // Update navigation params when step changes
        if (forgotPasswordStore.step !== previousStepRef.current) {
            previousStepRef.current = forgotPasswordStore.step;
            setTimeout(() => {
                navigation.setParams({
                    step: forgotPasswordStore.step,
                });
            });
        }

        let forgotChildScreen;
        switch (forgotPasswordStore.step) {
            case "Initial":
                forgotChildScreen = (
                    <ForgotInitialScreen navigation={navigation} />
                );
                break;
            case "Verify":
                forgotChildScreen = <ForgotVerifyScreen />;
                break;
            case "Success":
                forgotChildScreen = (
                    <ForgotSuccessScreen navigation={navigation} />
                );
                break;
        }

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
                        <Spinner isVisible={forgotPasswordStore.isFetching} />
                        {forgotChildScreen}
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

const styles = StyleSheet.create({
    keyboardAvoidingContainer: {
        flex: 1,
        justifyContent: "flex-end",
    },
});

export { ForgotPasswordScreen };
