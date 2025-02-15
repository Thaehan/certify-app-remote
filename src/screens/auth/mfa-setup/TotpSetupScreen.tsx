import Clipboard from "@react-native-clipboard/clipboard";
import { inject, observer } from "mobx-react";
import React, { FC, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Alert,
    Dimensions,
    Image,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Toast from "react-native-toast-message";
import {
    CathyRaisedButton,
    CathyTextButton,
} from "../../../shared-components/cathy/CathyButton";
import GenerateQRCodeForAuthenticator from "../../../shared-components/mfa-input/GenerateQRCodeForAuthenticator";
import { MfaInputView } from "../../../shared-components/mfa-input/MfaInputView";
import { AuthenticateStore } from "../../../stores/AuthenticateStore";
import { CallbackStore } from "../../../stores/CallbackStore";
import { CognitoSessionStore } from "../../../stores/CognitoSessionStore";
import { AllStores } from "../../../stores/RootStore";
import { UserPoolStore } from "../../../stores/UserPoolStore";
import { Colors } from "../../../utils/Colors";

interface Props {
    authenticateStore: AuthenticateStore;
    userPoolStore: UserPoolStore;
    callbackStore: CallbackStore;
    sessionStore: CognitoSessionStore;
}

/**
 * 'MFA' step of login flow
 *
 * @author NganNH
 */
const TOTPVerificationScreen: FC<Props> = inject(
    ({ rootStore }: AllStores) => ({
        authenticateStore: rootStore.authenticateStore,
        userPoolStore: rootStore.userPoolStore,
        callbackStore: rootStore.callbackStore,
        sessionStore: rootStore.cognitoSessionStore,
    })
)(
    observer(({ authenticateStore, callbackStore, sessionStore }) => {
        const [authenticatorCode, setAuthenticatorCode] = useState("");
        const mfaInputViewRef = useRef<MfaInputView>(null);
        const authenticatorCodeInputRef = useRef<TextInput>(null);
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

        const showToast = (
            type: "success" | "error",
            titleKey: string,
            messageKey: string
        ) => {
            Toast.show({
                type: type,
                position: "bottom",
                text1: t(titleKey),
                text2: t(messageKey),
                visibilityTime: 3000,
                autoHide: true,
            });
        };

        const copyToClipboard = (secretCode: string) => {
            if (secretCode) {
                Clipboard.setString(secretCode);
                showToast(
                    "success",
                    "auth.totp_setup.toast.success.title",
                    "auth.totp_setup.toast.success.message"
                );
            } else {
                showToast(
                    "error",
                    "auth.totp_setup.toast.error.title",
                    "auth.totp_setup.toast.error.message"
                );
            }
        };

        const onPressBackground = (): void => {
            Keyboard.dismiss();
        };

        const handleVerifyTOTP = async (): Promise<void> => {
            const appId = callbackStore.appId;
            try {
                await authenticateStore.associateSecretCode(
                    authenticatorCode,
                    appId
                );
            } catch (error) {
                showAlert(t("alert.title.error"), error as string);
                console.error("TOTP verification failed", error);
            }
        };

        const handleBack = (): void => {
            try {
                authenticateStore.setLoginStep("SelectPreferMethod");
            } catch (error) {
                console.error(
                    "TOTP verification failed",
                    JSON.stringify(error)
                );
            }
        };

        const onChangeCode = (code: string): void => {
            setAuthenticatorCode(code);
            if (code.length === 6) {
                Keyboard.dismiss();
            }
        };

        return (
            <View style={{ flex: 1, justifyContent: "center" }}>
                <View style={styles.topSpace} />
                <View style={styles.container}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>
                            {t("auth.totp_setup.title")}
                            <Text style={styles.mfaText}>
                                &nbsp; {t("auth.totp_setup.mfa")}
                            </Text>
                        </Text>
                    </View>
                    <View style={styles.shadowContainer}>
                        <View style={styles.qrCodeContainer}>
                            <View>
                                <Image
                                    style={styles.otpImage}
                                    source={require("../../../assets/image/auth/app-authentication.png")}
                                    resizeMode={"contain"}
                                />
                            </View>
                            <View>
                                <Text style={styles.stepText}>
                                    {t("auth.totp_setup.step_one")}
                                </Text>
                                <Text style={styles.qrCodeSub}>
                                    {t("auth.totp_setup.step_one_guide")}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.qrCodeContainer}>
                            <GenerateQRCodeForAuthenticator
                                issuer={"Certify"}
                                secretKey={authenticateStore.totpSecret}
                                accountName={
                                    sessionStore.currentCognitoUser?.getUsername() ||
                                    ""
                                }
                            />
                            <View>
                                <View>
                                    <Text style={styles.stepText}>
                                        {t("auth.totp_setup.step_two")}
                                    </Text>
                                    <Text style={styles.qrCodeSub}>
                                        {t("auth.totp_setup.step_two_guide")}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() =>
                                            copyToClipboard(
                                                authenticateStore.totpSecret
                                            )
                                        }
                                    >
                                        <Text style={styles.showSecretCode}>
                                            {t("auth.totp_setup.copy_code")}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        <View style={styles.codeInput}>
                            <View style={styles.CodeTitleContainer}>
                                <Text style={styles.codeSub}>
                                    {t("auth.totp_setup.enter_code")}
                                </Text>
                            </View>
                            <MfaInputView
                                ref={mfaInputViewRef}
                                onChangeCode={onChangeCode}
                            />
                        </View>
                    </View>

                    <CathyRaisedButton
                        disabled={authenticatorCode.length < 6}
                        style={styles.loginButton}
                        text={t("auth.submit")}
                        onPress={handleVerifyTOTP}
                    />
                    <View style={styles.middleSpace1} />

                    <CathyTextButton
                        text={t("auth.back")}
                        onPress={handleBack}
                    />
                </View>
                <View style={styles.bottomSpace} />
            </View>
        );
    })
);

const screenHeight = Dimensions.get("screen").height;
const styles = StyleSheet.create({
    topSpace: {
        height: (40 * (screenHeight - 222)) / 509,
    },
    middleSpace1: {
        height: (10 * (screenHeight - 222)) / 509,
        minHeight: 16,
    },
    bottomSpace: {
        flex: 1, // 381
    },
    menuAnchor: {
        height: 1,
        backgroundColor: "transparent",
    },
    loginButton: {
        flexGrow: 1,
        marginHorizontal: 0,
    },
    qrCodeContainer: {
        margin: 10,
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "flex-start",
    },
    container: {
        backgroundColor: "white",
        margin: 20,
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    titleContainer: {},
    qrCodeSub: {
        margin: 10,
        width: 150,
        marginBottom: 5,
    },
    otpImage: {
        alignSelf: "center",
        width: 100,
        height: 100,
    },
    CodeContainer: {
        margin: 10,
        justifyContent: "flex-start",
        alignItems: "flex-start",
    },
    CodeTitleContainer: {},
    codeSub: {
        margin: 10,
    },
    showSecretCode: {
        marginTop: 0,
        margin: 10,
        color: Colors.cathyBlueDark,
        width: 150,
    },
    mfaText: {
        color: Colors.cathyBlue,
    },
    shadowContainer: {
        marginVertical: "2%",
        backgroundColor: "white",
        elevation: 5, // Add elevation for a shadow effect (Android)
        shadowColor: "#000", // Shadow color (iOS)
        shadowOffset: { width: 0, height: 2 }, // Shadow offset (iOS)
        shadowOpacity: 0.2, // Shadow opacity (iOS)
        shadowRadius: 4, // Shadow radius (iOS)
        borderRadius: 8,
        padding: 10,
    },
    codeInput: {
        marginBottom: 10,
    },
    stepText: {
        marginHorizontal: 10,
        fontWeight: "bold",
    },
    title: {
        fontSize: 24,
        fontFamily: "Roboto-Regular",
        lineHeight: 32,
        textAlign: "left",
        color: Colors.cathyMajorText,
    },
});

export default TOTPVerificationScreen;
