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
import React, {
    PureComponent,
    Fragment
} from 'react';
import {
    View,
    Image,
    Alert,
    Keyboard,
    Dimensions,
    StyleSheet,
} from 'react-native';
import { inject } from 'mobx-react';
import { I18n } from '../../../utils/I18n';
import { AllStores } from '../../../stores/RootStore';
import { AuthenticateStore } from '../../../stores/AuthenticateStore';
import { MfaInputView } from '../../../shared-components/mfa-input/MfaInputView';
import { TextFix } from '../../../shared-components/cathy/IOSFix';
import { CathyRaisedButton, CathyTextButton } from '../../../shared-components/cathy/CathyButton';
import { cathyViews } from '../../../shared-components/cathy/CommonViews';
import { Colors } from '../../../utils/Colors';

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
 * @author Lingqi
 */
@inject(({ rootStore }: AllStores) => ({
    authenticateStore: rootStore.authenticateStore,
}))
export class LoginMFAScreen extends PureComponent<Props, State> {

    static defaultProps = {
        authenticateStore: undefined
    };

    private mfaInputView!: MfaInputView;

    private readonly OTP_MAX = 40;
    private mfaCode: string;
    private timerId!: ReturnType<typeof setInterval>;

    constructor(props: Props) {
        super(props);
        this.mfaCode = '';
        this.state = {
            mfaSent: true,
            countDown: this.OTP_MAX,
        };
        this.onPressResend = this.onPressResend.bind(this);
        this.onChangeCode = this.onChangeCode.bind(this);
        this.handleBack = this.handleBack.bind(this);
        this.onPressProceed = this.onPressProceed.bind(this);

    }

    //**************************************************************
    // Component Lifecycle
    //****************************************************************

    componentDidMount() {
        this.timerId = setInterval(this.updateCountdown, 1000);
    }
    
    componentWillUnmount() {
        clearInterval(this.timerId);
    }

    //**************************************************************
    // MFA Callbacks
    //****************************************************************

    private onChangeCode = (code: string): void => {
        this.mfaCode = code;
    }

    //**************************************************************
    // Helper Functions
    //****************************************************************

    private updateCountdown = (): void => {
        if (this.state.mfaSent) {
            this.setState(prevState => ({
                mfaSent: prevState.countDown > 1,
                countDown: prevState.countDown - 1,
                }));
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
        this.props.authenticateStore.resendOTP()
            .then()
            .catch((err: string) => {
                this.showAlert(I18n.t('alert.title.error'), err);
                this.setState({ mfaSent: false });
            });
    }

    private onPressProceed(): void {
        if(this.props.authenticateStore.otpMode == 'SetupSmsMfa'){
            this.props.authenticateStore.sendCodeSmsMFA(this.mfaCode)
        }else{
            this.props.authenticateStore.sendMFACode(this.mfaCode)
            .then()
            .catch((err: string) => {
                this.showAlert(I18n.t('alert.title.error'), err);
                this.mfaInputView.clear();
                this.mfaCode = '';
            });
        }
      
    }

    //**************************************************************
    // Other Methods
    //****************************************************************

    private showAlert(title: string, message: string): void {
        setTimeout(() => {
            Alert.alert(
                title,
                message,
                [{ text: I18n.t('alert.button.ok'), style: 'cancel' }],
                { cancelable: false },
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
        const { authenticateStore } = this.props;
        return (
            <View style={styles.container}>
                <View style={styles.content}>
                    <TextFix style={styles.title}>
                        {I18n.t('auth.login.mfa_title')}
                    </TextFix>
                    <TextFix style={styles.subtitle}>
                        {authenticateStore.verifyDetail.type === 'email' ?
                            I18n.t('auth.otp_email', { value: authenticateStore.verifyDetail.value }) :
                            I18n.t('auth.otp_phone', { value: authenticateStore.verifyDetail.value })}
                    </TextFix>
                    <View style={styles.middleSpace2} />
                    {this.state.mfaSent ? (
                        <TextFix style={cathyViews.countDown}>
                            {I18n.t('auth.otp_count', { count: this.state.countDown })}
                        </TextFix>
                    ) : (
                        <CathyTextButton
                            text={I18n.t('auth.otp_button')}
                            onPress={this.onPressResend} />
                    )}
                    <View style={styles.middleSpace2} />
                    <MfaInputView
                        ref={(mfaInputView) => this.mfaInputView = mfaInputView!}
                        onChangeCode={this.onChangeCode} />
                    <View style={styles.middleSpace3} />

                    <CathyRaisedButton
                        disabled={this.mfaCode.length < 6}
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
            </View>
        );
    }
}

const screenHeight = Dimensions.get('screen').height;
const styles = StyleSheet.create({ 
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    content: {
        backgroundColor: 'white',
        margin: 20,
        padding: 20,
    },
    topSpace: {
        height: (screenHeight > 660 ? 96 : 80) * (screenHeight - 272) / 459,
    },
    otpImage: {
        alignSelf: 'center',
        width: 100,
        height: 96,
    },
    middleSpace1: {
        height: (10 * (screenHeight - 272)) / 459,
        minHeight: 16,
        maxHeight: 32,
    },
    middleSpace2: {
        height: (screenHeight > 660 ? 26 : 14) * (screenHeight - 272) / 459,
    },
    middleSpace3: {
        height: 20 * (screenHeight - 272) / 459,
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
    subtitle: {
        marginTop: 8,
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        textAlign: 'center',
        color: Colors.helperText,
    },
    loginButton: {
        flexGrow: 1,
        marginHorizontal: 0,
    },
});
