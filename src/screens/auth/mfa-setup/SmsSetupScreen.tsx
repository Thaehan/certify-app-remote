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
import React, { PureComponent } from "react";
import {
    View,
    Image,
    Alert,
    Keyboard,
    Dimensions,
    StyleSheet,
    Text,
} from "react-native";
import { inject } from "mobx-react";
import { I18n } from "../../../utils/I18n";
import { AllStores } from "../../../stores/RootStore";
import { AuthenticateStore } from "../../../stores/AuthenticateStore";
import { MfaInputView } from "../../../shared-components/mfa-input/MfaInputView";
import { TextFix } from "../../../shared-components/cathy/IOSFix";
import {
    CathyRaisedButton,
    CathyTextButton,
} from "../../../shared-components/cathy/CathyButton";
import { cathyViews } from "../../../shared-components/cathy/CommonViews";
import { Colors } from "../../../utils/Colors";

interface Props {
    authenticateStore: AuthenticateStore;
}
interface State {
    mfaSent: boolean;
    countDown: number;
}

/**
 * 'MFA' step of login flow
 *
 * @author NganNH
 */
@inject(({ rootStore }: AllStores) => ({
    authenticateStore: rootStore.authenticateStore,
}))
export class SmsSetupScreen extends PureComponent<Props, State> {
    static defaultProps = {
        authenticateStore: undefined,
    };

    private mfaInputView!: MfaInputView;

    private readonly OTP_MAX = 40;
    private mfaCode: string;
    private timerId!: ReturnType<typeof setInterval>;

    constructor(props: Props) {
        super(props);
        this.mfaCode = "";
        this.state = {
            mfaSent: true,
            countDown: this.OTP_MAX,
        };
        this.onPressResend = this.onPressResend.bind(this);
        this.onChangeCode = this.onChangeCode.bind(this);
        this.getLastThreeDigits = this.getLastThreeDigits.bind(this);
        this.handleBack = this.handleBack.bind(this);
        this.onPressProceed = this.onPressProceed.bind(this);
    }

    //**************************************************************
    // Component Lifecycle
    //****************************************************************

    componentDidMount() {
        this.timerId = setInterval(() => {
            if (this.state.mfaSent) {
                if (this.state.countDown === 1) {
                    this.setState({ mfaSent: false });
                } else {
                    this.setState({
                        countDown: this.state.countDown - 1,
                    });
                }
            }
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.timerId);
    }

    //**************************************************************
    // MFA Callbacks
    //****************************************************************

    private onChangeCode(code: string): void {
        this.mfaCode = code;
        if (this.mfaCode.length === 6) {
            Keyboard.dismiss();
        }
    }

    //**************************************************************
    // Button Callbacks
    //****************************************************************

    private onPressResend(): void {
        Keyboard.dismiss();
        this.setState({
            mfaSent: true,
            countDown: this.OTP_MAX,
        });
        this.props.authenticateStore
            .resendOTP()
            .then()
            .catch((err: string) => {
                this.showAlert(I18n.t("alert.title.error"), err);
                this.setState({ mfaSent: false });
            });
    }

    private onPressProceed(): void {
        this.props.authenticateStore
            .sendCodeSmsMFA(this.mfaCode)
            .catch((err: string) => {
                this.showAlert(I18n.t("alert.title.error"), err);
                this.setState({ mfaSent: false });
            });
    }

    handleBack = () => {
        try {
            this.props.authenticateStore.setLoginStep("SelectPreferMethod");
        } catch (error) {
            console.error("TOTP verification failed", error);
            // Handle verification failure
        }
    };
    //**************************************************************
    // Other Methods
    //****************************************************************

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
    private getLastThreeDigits(phoneNumber: string) {
        // Ensure phoneNumber is a string
        const phoneNumberString = String(phoneNumber);

        // Use substr to get the last three characters
        const lastThreeDigits = phoneNumberString.slice(-3);

        return lastThreeDigits;
    }

    //**************************************************************
    // Render
    //****************************************************************

    render() {
        const { authenticateStore } = this.props;
        return (
            <View style={{ flex: 1, justifyContent: "center" }}>
                <View style={styles.topSpace} />
                <View
                    style={{
                        backgroundColor: "white",
                        margin: 20,
                        padding: 20,
                    }}
                >
                    <View>
                        <Text style={styles.title}>
                            {I18n.t("auth.sms_setup.title")}
                            <Text style={styles.mfaText}>
                                &nbsp;{I18n.t("auth.sms_setup.mfa")}
                            </Text>
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.subtitle}>
                            {I18n.t('auth.otp_phone', { value: authenticateStore.verifyDetail.value })}
                        </Text>
                    </View>

                    <View style={styles.resentContainer}>
                        {this.state.mfaSent ? (
                            <TextFix style={cathyViews.countDown}>
                                {I18n.t("auth.otp_count", {
                                    count: this.state.countDown,
                                })}
                            </TextFix>
                        ) : (
                            <CathyTextButton
                                text={I18n.t("auth.otp_button")}
                                onPress={this.onPressResend}
                            />
                        )}
                    </View>
                    <View>
                        <MfaInputView
                            ref={(mfaInputView) =>
                                (this.mfaInputView = mfaInputView!)
                            }
                            onChangeCode={this.onChangeCode}
                        />
                    </View>
                    <View style={styles.submitContainer}>
                        <CathyRaisedButton
                            disabled={this.mfaCode.length < 6}
                            style={styles.loginButton}
                            text="Submit"
                            onPress={this.onPressProceed}
                        />
                        <View style={styles.middleSpace1} />

                        <CathyTextButton
                            text="Back"
                            onPress={this.handleBack}
                        />
                    </View>
                </View>

                <View style={styles.bottomSpace} />
            </View>
        );
    }
}

const screenHeight = Dimensions.get("screen").height;
const styles = StyleSheet.create({
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
