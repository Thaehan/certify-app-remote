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
import React, { PureComponent, Fragment } from "react";
import { View, Image, Alert, Dimensions, StyleSheet } from "react-native";
import { inject } from "mobx-react";
import { I18n } from "../../../utils/I18n";
import { AllStores } from "../../../stores/RootStore";
import { AuthenticateStore } from "../../../stores/AuthenticateStore";
import { MfaInputView } from "../../../shared-components/mfa-input/MfaInputView";
import { TextFix } from "../../../shared-components/cathy/IOSFix";

import { cathyViews } from "../../../shared-components/cathy/CommonViews";
import { Colors } from "../../../utils/Colors";
import {
    CathyRaisedButton,
    CathyTextButton,
} from "../../../shared-components/cathy/CathyButton";

interface Props {
    authenticateStore: AuthenticateStore;
}
interface State {
    mfaCode: string;
}

/**
 * 'MFA' step of login flow
 *
 * @author Lingqi
 */
@inject(({ rootStore }: AllStores) => ({
    authenticateStore: rootStore.authenticateStore,
}))
export class LoginTOTPScreen extends PureComponent<Props, State> {
    static defaultProps = {
        authenticateStore: undefined,
    };

    private mfaInputView!: MfaInputView;

    private timerId!: ReturnType<typeof setInterval>;

    constructor(props: Props) {
        super(props);
        this.state = {
            mfaCode: "",
        };
        // this.onPressResend = this.onPressResend.bind(this);
        this.onChangeCode = this.onChangeCode.bind(this);
        this.onPressProceed = this.onPressProceed.bind(this);
        this.handleBack = this.handleBack.bind(this);
    }

    //**************************************************************
    // Component Lifecycle
    //****************************************************************

    componentWillUnmount() {
        clearInterval(this.timerId);
    }
    //**************************************************************
    // MFA Callbacks
    //****************************************************************

    private onChangeCode(code: string): void {
        this.setState({
            mfaCode: code,
        },()=>{
            if(this.state.mfaCode.length == 6){
                this.onPressProceed()
            }
        });
    }

    //**************************************************************
    // Button Callbacks
    //****************************************************************

    private async onPressProceed(): Promise<void> {
        await this.props.authenticateStore
            .sendMFACode(this.state.mfaCode, "SOFTWARE_TOKEN_MFA")
            .catch((err: string) => {
                this.showAlert(I18n.t("alert.title.error"), err);
                this.mfaInputView.clear();

                this.setState({
                    mfaCode: "",
                });
            });
    }
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

    handleBack = () => {
        this.props.authenticateStore.clearStates();
    };
    //**************************************************************
    // Render
    //****************************************************************

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.innerContainer}>
                    <TextFix style={styles.title}>
                        {I18n.t("auth.login.mfa_title")}
                    </TextFix>
                    <TextFix style={styles.subtitle}>
                        {I18n.t("auth.login.mfa_subtitle")}
                    </TextFix>
                    <View style={styles.middleSpace2} />
                    <MfaInputView
                        ref={(mfaInputView) =>
                            (this.mfaInputView = mfaInputView!)
                        }
                        onChangeCode={(code) => {
                            this.onChangeCode(code);
                        }}
                    />
                    <View style={styles.middleSpace3} />
                    <TextFix style={styles.subtitle}>
                        {I18n.t("auth.login.lost_totp_access")}
                    </TextFix>
                    <View style={styles.middleSpace3} />
                    <CathyRaisedButton
                        disabled={this.state.mfaCode.length < 6}
                        style={styles.loginButton}
                        text={I18n.t("auth.submit")}
                        onPress={this.onPressProceed}
                    />
                    <View style={styles.middleSpace1} />
                    <CathyTextButton
                        text={I18n.t("auth.back")}
                        onPress={this.handleBack}
                    />
                </View>
                {/* <View style={styles.bottomSpace} /> */}
            </View>
        );
    }
}

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
