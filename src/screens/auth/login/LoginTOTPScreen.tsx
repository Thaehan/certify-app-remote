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
import React, { FC, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Dimensions, StyleSheet, View } from "react-native";
import {
    CathyRaisedButton,
    CathyTextButton,
} from "../../../shared-components/cathy/CathyButton";
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
 * @author Lingqi
 */
const LoginTOTPScreen: FC<Props> = inject(({ rootStore }: AllStores) => ({
    authenticateStore: rootStore.authenticateStore,
}))(
    observer(({ authenticateStore }) => {
        const [mfaCode, setMfaCode] = useState("");
        const mfaInputViewRef = useRef<MfaInputView>(null);
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

        const onChangeCode = (code: string): void => {
            setMfaCode(code);
            if (code.length === 6) {
                onPressProceed();
            }
        };

        const onPressProceed = async (): Promise<void> => {
            try {
                await authenticateStore.sendMFACode(
                    mfaCode,
                    "SOFTWARE_TOKEN_MFA"
                );
            } catch (err) {
                showAlert(t("alert.title.error"), err as string);
                mfaInputViewRef.current?.clear();
                setMfaCode("");
            }
        };

        const handleBack = (): void => {
            authenticateStore.clearStates();
        };

        return (
            <View style={styles.container}>
                <View style={styles.innerContainer}>
                    <TextFix style={styles.title}>
                        {t("auth.login.mfa_title")}
                    </TextFix>
                    <TextFix style={styles.subtitle}>
                        {t("auth.login.mfa_subtitle")}
                    </TextFix>
                    <View style={styles.middleSpace2} />
                    <MfaInputView
                        ref={mfaInputViewRef}
                        onChangeCode={onChangeCode}
                    />
                    <View style={styles.middleSpace3} />
                    <TextFix style={styles.subtitle}>
                        {t("auth.login.lost_totp_access")}
                    </TextFix>
                    <View style={styles.middleSpace3} />
                    <CathyRaisedButton
                        disabled={mfaCode.length < 6}
                        style={styles.loginButton}
                        text={t("auth.submit")}
                        onPress={onPressProceed}
                    />
                    <View style={styles.middleSpace1} />
                    <CathyTextButton
                        text={t("auth.back")}
                        onPress={handleBack}
                    />
                </View>
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
    innerContainer: {
        backgroundColor: "white",
        margin: 20,
        padding: 20,
    },
    topSpace: {
        height: ((screenHeight > 660 ? 96 : 80) * (screenHeight - 272)) / 459,
    },
    otpImage: {
        alignSelf: "center",
        width: 100,
        height: 96,
    },
    middleSpace1: {
        height: (10 * (screenHeight - 272)) / 459,
        minHeight: 16,
        maxHeight: 32,
    },
    subtitle: {
        marginTop: 8,
        fontFamily: "Roboto-Regular",
        fontSize: 14,
        textAlign: "center",
        color: Colors.helperText,
    },
    middleSpace2: {
        height: ((screenHeight > 660 ? 26 : 13) * (screenHeight - 272)) / 459,
    },
    middleSpace3: {
        height: (20 * (screenHeight - 272)) / 459,
    },
    bottomSpace: {
        flex: 1, // 223
    },
    title: {
        fontSize: 24,
        fontFamily: "Roboto-Regular",
        lineHeight: 32,
        textAlign: "center",
        color: Colors.cathyBlueDark,
    },
    loginButton: {
        flexGrow: 1,
        marginHorizontal: 0,
    },
});

export { LoginTOTPScreen };
