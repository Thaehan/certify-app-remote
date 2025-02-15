import React, { Component } from "react";
import {
    View,
    Text,
    TextInput,
    Dimensions,
    StyleSheet,
    Keyboard,
    Image,
    TouchableOpacity,
    Alert,
} from "react-native";
import { inject, observer } from "mobx-react";
import { AllStores } from "../../../stores/RootStore";
import { AuthenticateStore } from "../../../stores/AuthenticateStore";
import { Colors } from "../../../utils/Colors";

import {
    CathyRaisedButton,
    CathyTextButton,
} from "../../../shared-components/cathy/CathyButton";
import { UserPoolStore } from "../../../stores/UserPoolStore";
import GenerateQRCodeForAuthenticator from "../../../shared-components/mfa-input/GenerateQRCodeForAuthenticator";
import { CallbackStore } from "../../../stores/CallbackStore";
import { CognitoSessionStore } from "../../../stores/CognitoSessionStore";
import { MfaInputView } from "../../../shared-components/mfa-input/MfaInputView";
import I18n from "i18n-js";
import Clipboard from "@react-native-clipboard/clipboard";
import Toast from "react-native-toast-message";

interface State {
    authenticatorCode: string;
}
interface Props {
    authenticateStore: AuthenticateStore;
    userPoolStore: UserPoolStore;
    callbackStore: CallbackStore;
    sessionStore: CognitoSessionStore;
}
@inject(({ rootStore }: AllStores) => ({
    authenticateStore: rootStore.authenticateStore,
    userPoolStore: rootStore.userPoolStore,
    callbackStore: rootStore.callbackStore,
    sessionStore: rootStore.cognitoSessionStore,
}))
/**
 * 'MFA' step of login flow
 *
 * @author NganNH
 */
@observer
class TOTPVerificationScreen extends Component<Props, State> {
    private authenticatorCodeInput!: TextInput;
    static defaultProps = {
        userPoolStore: undefined,
        authenticateStore: undefined,
        callbackStore: undefined,
        sessionStore: undefined,
    };
    private mfaInputView!: MfaInputView;

    constructor(props: Props) {
        super(props);
        this.state = {
            authenticatorCode: "",
        };
        this.onChangeCode = this.onChangeCode.bind(this);
        this.handleBack = this.handleBack.bind(this);
        this.onPressBackground = this.onPressBackground.bind(this);
        this.onChangeAuthenticatorCode =
            this.onChangeAuthenticatorCode.bind(this);
    }
    //**************************************************************
    // Button Callbacks
    //****************************************************************
    private onPressBackground(): void {
        Keyboard.dismiss();
    }
    handleVerifyTOTP = async () => {
        const appId = this.props.callbackStore.appId;
        try {
            await this.props.authenticateStore.associateSecretCode(
                this.state.authenticatorCode,
                appId
            );
        } catch (error) {
            this.showAlert(I18n.t("alert.title1.error"), error as string);
            console.error("TOTP verification failed", error);
            // Handle verification failure
        }
    };

    handleBack = () => {
        try {
            this.props.authenticateStore.setLoginStep("SelectPreferMethod");
        } catch (error) {
            console.error("TOTP verification failed", JSON.stringify(error));
            // Handle verification failure
        }
    };
    //**************************************************************
    // TextEdit Callbacks
    //****************************************************************

    private onChangeAuthenticatorCode(text: string): void {
        this.setState({ authenticatorCode: text });
    }
    private onChangeCode(code: string): void {
        this.setState({ authenticatorCode: code });
        if (code.length == 6) {
            Keyboard.dismiss();
        }
    }
    private showAlert(title: string, message: string): void {
        setTimeout(() => {
            Alert.alert(
                title,
                message,
                [{ text: I18n.t("alert.button.ok"), style: "cancel" }],
                { cancelable: false }
            );
        }, 100);
    }
    private showToast(
        type: "success" | "error",
        titleKey: string,
        messageKey: string
    ) {
        Toast.show({
            type: type,
            position: "bottom",
            text1: I18n.t(titleKey),
            text2: I18n.t(messageKey),
            visibilityTime: 3000,
            autoHide: true,
        });
    }

    private copyToClipboard(secretCode: string) {
        if (secretCode) {
            Clipboard.setString(secretCode);
            this.showToast(
                "success",
                "auth.totp_setup.toast.success.title",
                "auth.totp_setup.toast.success.message"
            );
        } else {
            this.showToast(
                "error",
                "auth.totp_setup.toast.error.title",
                "auth.totp_setup.toast.error.message"
            );
        }
    }
    render() {
        return (
            <View style={{ flex: 1, justifyContent: "center" }}>
                <View style={styles.topSpace} />
                <View style={styles.container}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>
                            {I18n.t("auth.totp_setup.title")}
                            <Text style={styles.mfaText}>
                                &nbsp; {I18n.t("auth.totp_setup.mfa")}
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
                                    {I18n.t("auth.totp_setup.step_one")}{" "}
                                </Text>
                                <Text style={styles.qrCodeSub}>
                                    {I18n.t("auth.totp_setup.step_one_guide")}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.qrCodeContainer}>
                            <GenerateQRCodeForAuthenticator
                                issuer={"Certify"}
                                secretKey={
                                    this.props.authenticateStore.totpSecret
                                }
                                accountName={
                                    this.props.sessionStore.currentCognitoUser?.getUsername() ||
                                    ""
                                }
                            />
                            <View>
                                <View>
                                    <Text style={styles.stepText}>
                                        {I18n.t("auth.totp_setup.step_two")}
                                    </Text>
                                    <Text style={styles.qrCodeSub}>
                                        {I18n.t(
                                            "auth.totp_setup.step_two_guide"
                                        )}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.copyToClipboard(
                                                this.props.authenticateStore
                                                    .totpSecret
                                            );
                                        }}
                                    >
                                        <Text style={styles.showSecretCode}>
                                            {I18n.t(
                                                "auth.totp_setup.copy_code"
                                            )}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        <View style={styles.codeInput}>
                            <View style={styles.CodeTitleContainer}>
                                <Text style={styles.codeSub}>
                                    {I18n.t("auth.totp_setup.enter_code")}
                                </Text>
                            </View>
                            <MfaInputView
                                ref={(mfaInputView) =>
                                    (this.mfaInputView = mfaInputView!)
                                }
                                onChangeCode={this.onChangeCode}
                            />
                        </View>
                    </View>

                    <CathyRaisedButton
                        disabled={this.state.authenticatorCode.length < 6}
                        style={styles.loginButton}
                        text={I18n.t("auth.submit")}
                        onPress={this.handleVerifyTOTP}
                    />
                    <View style={styles.middleSpace1} />

                    <CathyTextButton
                        text={I18n.t("auth.back")}
                        onPress={this.handleBack}
                    />
                </View>

                <View style={styles.bottomSpace} />
            </View>
        );
    }
}

export default TOTPVerificationScreen;
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
