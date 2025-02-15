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
import React, { FC, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Alert,
    Dimensions,
    Keyboard,
    StyleSheet,
    Text,
    View,
} from "react-native";
import {
    CathyRaisedButton,
    CathyTextButton,
} from "../../../shared-components/cathy/CathyButton";
import { cathyViews } from "../../../shared-components/cathy/CommonViews";
import { TextFix } from "../../../shared-components/cathy/IOSFix";
import { MfaInputView } from "../../../shared-components/mfa-input/MfaInputView";
import { AuthenticateStore } from "../../../stores/AuthenticateStore";
import { AllStores } from "../../../stores/RootStore";
import { Colors } from "../../../utils/Colors";

interface Props {
    authenticateStore: AuthenticateStore;
}

/**
 * 'MFA' step of login flow
 *
 * @author NganNH
 */
const SmsSetupScreen: FC<Props> = inject(({ rootStore }: AllStores) => ({
    authenticateStore: rootStore.authenticateStore,
}))(
    observer(({ authenticateStore }) => {
        const OTP_MAX = 40;
        const [mfaSent, setMfaSent] = useState(true);
        const [countDown, setCountDown] = useState(OTP_MAX);
        const [mfaCode, setMfaCode] = useState("");

        const mfaInputViewRef = useRef<MfaInputView>(null);

        const { t } = useTranslation();

        useEffect(() => {
            const timerId = setInterval(() => {
                if (mfaSent) {
                    setCountDown((prevCount) => {
                        if (prevCount === 1) {
                            setMfaSent(false);
                            return OTP_MAX;
                        }
                        return prevCount - 1;
                    });
                }
            }, 1000);

            return () => clearInterval(timerId);
        }, [mfaSent]);

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

        const onChangeCode = (code: string): void => {
            setMfaCode(code);
            if (code.length === 6) {
                Keyboard.dismiss();
            }
        };

        const onPressResend = async (): Promise<void> => {
            Keyboard.dismiss();
            setMfaSent(true);
            setCountDown(OTP_MAX);

            try {
                await authenticateStore.resendOTP();
            } catch (err) {
                showAlert(t("alert.title.error"), err as string);
                setMfaSent(false);
            }
        };

        const onPressProceed = async (): Promise<void> => {
            try {
                await authenticateStore.sendCodeSmsMFA(mfaCode);
            } catch (err) {
                showAlert(t("alert.title.error"), err as string);
                setMfaSent(false);
            }
        };

        const handleBack = (): void => {
            try {
                authenticateStore.setLoginStep("SelectPreferMethod");
            } catch (error) {
                console.error("TOTP verification failed", error);
            }
        };

        const getLastThreeDigits = (phoneNumber: string): string => {
            const phoneNumberString = String(phoneNumber);
            return phoneNumberString.slice(-3);
        };

        return (
            <View style={styles.container}>
                <View style={styles.topSpace} />
                <View style={styles.contentContainer}>
                    <View>
                        <Text style={styles.title}>
                            {t("auth.sms_setup.title")}
                            <Text style={styles.mfaText}>
                                &nbsp;{t("auth.sms_setup.mfa")}
                            </Text>
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.subtitle}>
                            {t("auth.otp_phone", {
                                value: authenticateStore.verifyDetail.value,
                            })}
                        </Text>
                    </View>

                    <View style={styles.resentContainer}>
                        {mfaSent ? (
                            <TextFix style={cathyViews.countDown}>
                                {t("auth.otp_count", { count: countDown })}
                            </TextFix>
                        ) : (
                            <CathyTextButton
                                text={t("auth.otp_button")}
                                onPress={onPressResend}
                            />
                        )}
                    </View>
                    <View>
                        <MfaInputView
                            ref={mfaInputViewRef}
                            onChangeCode={onChangeCode}
                        />
                    </View>
                    <View style={styles.submitContainer}>
                        <CathyRaisedButton
                            disabled={mfaCode.length < 6}
                            style={styles.loginButton}
                            text="Submit"
                            onPress={onPressProceed}
                        />
                        <View style={styles.middleSpace1} />
                        <CathyTextButton text="Back" onPress={handleBack} />
                    </View>
                </View>
                <View style={styles.bottomSpace} />
            </View>
        );
    })
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
        height: ((screenHeight > 660 ? 96 : 80) * (screenHeight - 272)) / 459,
    },
    middleSpace1: {
        height: ((screenHeight > 660 ? 28 : 24) * (screenHeight - 272)) / 459,
        minHeight: 16,
        maxHeight: 32,
    },
    subtitle: {
        marginTop: 8,
        color: Colors.cathyGrey,
        fontSize: 15,
        fontFamily: "Roboto-Regular",
        textAlign: "left",
    },
    middleSpace3: {
        height: (56 * (screenHeight - 272)) / 459,
    },
    bottomSpace: {
        flex: 1, // 223
    },
    title: {
        fontSize: 24,
        fontFamily: "Roboto-Regular",
        lineHeight: 32,
        textAlign: "left",
        color: Colors.cathyMajorText,
    },
    mfaText: {
        color: Colors.cathyBlue,
    },
    loginButton: {
        flexGrow: 1,
        marginHorizontal: 0,
    },
    resentContainer: {
        marginVertical: 20,
    },
    submitContainer: {
        marginVertical: 20,
    },
});

export { SmsSetupScreen };
