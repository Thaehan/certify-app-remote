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
    Fragment,
} from 'react';
import {
    View,
    Image,
    TextInput,
    Keyboard,
    Alert,
    StyleSheet,
    Dimensions,
    Text,
} from 'react-native';
import { inject } from 'mobx-react';
import { I18n } from '../../../utils/I18n';
import { AllStores } from '../../../stores/RootStore';
import { ForgotPasswordStore } from '../../../stores/ForgotPasswordStore';
import { MfaInputView } from '../../../shared-components/mfa-input/MfaInputView';
import { TextFix } from '../../../shared-components/cathy/IOSFix';
import { CathyTextField } from '../../../shared-components/cathy/CathyTextField';
import {
    CathyRaisedButton,
    CathyTextButton,
} from '../../../shared-components/cathy/CathyButton';
import { cathyViews } from '../../../shared-components/cathy/CommonViews';
import Color from 'color';
import { red } from 'color-name';
import { Menu, renderers, MenuTrigger, MenuOptions, MenuProvider } from 'react-native-popup-menu';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

interface Props {
    forgotPasswordStore: ForgotPasswordStore;
}
interface State {
    otpSent: boolean;
    countDown: number;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasCharacterLimit: boolean;
    hasSymbol: boolean;
    hasNumber: boolean;
    visible: boolean;
    matchVisible: boolean;
}

/**
 * 'Verify' step of forgot-password flow
 *
 * @author Lingqi
 */
@inject(({ rootStore }: AllStores) => ({
    forgotPasswordStore: rootStore.forgotPasswordStore,
}))
export class ForgotVerifyScreen extends PureComponent<Props, State> {

    static defaultProps = {
        forgotPasswordStore: undefined,
    };

    private mfaInputView!: MfaInputView;
    private passwordInput!: TextInput;
    private confirmInput!: TextInput;

    private readonly OTP_MAX = 40;
    private otpCode: string;
    private timerId!: ReturnType<typeof setInterval>;
    private password: string;
    private confirmPass: string;
    private keyboardDidHideListener: any;

    constructor(props: Props, ctx: any) {
        super(props, ctx);
        this.otpCode = '';
        this.password = '';
        this.confirmPass = '';
        this.state = {
            otpSent: true,
            countDown: this.OTP_MAX,
            hasUpperCase: false,
            hasLowerCase: false,
            hasCharacterLimit: false,
            hasSymbol: false,
            hasNumber: false,
            visible: false,
            matchVisible: false,
        };
        this.onChangePassword = this.onChangePassword.bind(this);
        this.onChangeConfirmPass = this.onChangeConfirmPass.bind(this);
        this.onSubmitPassword = this.onSubmitPassword.bind(this);
        this.onSubmitConfirmPass = this.onSubmitConfirmPass.bind(this);
        this.onChangeCode = this.onChangeCode.bind(this);
        this.onPressResend = this.onPressResend.bind(this);
        this.onPressProceed = this.onPressProceed.bind(this);
        this._keyboardDidHide = this._keyboardDidHide.bind(this);
    }

    //**************************************************************
    // Component Lifecycle
    //****************************************************************

    componentDidMount() {
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
        this.timerId = setInterval(() => {
            if (this.state.otpSent) {
                if (this.state.countDown === 1) {
                    this.setState({ otpSent: false });
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
        this.keyboardDidHideListener.remove();
    }

    _keyboardDidHide(): void {
        this.setState({
            visible: false,
        });
    }

    //**************************************************************
    // TextEdit Callbacks
    //****************************************************************

    private onChangePassword(text: string): void {
        this.props.forgotPasswordStore.emptyPasswordCheck(text);
        if (!this.state.visible && this.passwordInput.isFocused()) {
            this.setState({
                visible: true,
            });
        }
        this.checkString(text);
        if (this.checkStringBool(text)) {
            if (text === this.confirmPass && this.otpCode) {
                this.setState({
                    matchVisible: true,
                });
            } else {
                this.setState({
                    matchVisible: false
                });
            }
            this.onEndTooltipEditting();
        }
        this.password = text;
    }

    private onChangeConfirmPass(text: string): void {
        if (text === this.password && this.otpCode) {
            this.setState({
                matchVisible: true,
            });
        } else {
            this.setState({
                matchVisible: false
            });
        }
        this.confirmPass = text;
    }

    private onSubmitPassword(): void {
        this.confirmInput.focus();
    }

    private onSubmitConfirmPass(): void {
        this.onPressProceed();
    }

    private onChangeCode(code: string): void {
        this.otpCode = code;
    }

    private onEndTooltipEditting(): void {
        this.setState({
            visible: false
        });
    }

    //**************************************************************
    // Button Callbacks
    //****************************************************************

    private onPressResend(): void {
        Keyboard.dismiss();
        this.setState({
            otpSent: true,
            countDown: this.OTP_MAX,
        });
        this.props.forgotPasswordStore.resendOTP()
            .then()
            .catch((err: string) => {
                this.showAlert(I18n.t('alert.title.error'), err);
            });
    }

    private onPressProceed(): void {
        Keyboard.dismiss();
        if (!this.password || !this.confirmPass) {
            this.showAlert(
                I18n.t('alert.title.missing'),
                I18n.t('alert.missing_password')
            );
            return;
        }
        if (this.password !== this.confirmPass) {
            this.showAlert(
                I18n.t('alert.title.error'),
                I18n.t('alert.password_match')
            );
            return;
        }
        if (this.otpCode.length < 6) {
            this.showAlert(
                I18n.t('alert.title.missing'),
                I18n.t('alert.missing_OTP')
            );
            return;
        }
        this.props.forgotPasswordStore.confirmPassword(this.otpCode, this.password)
            .then()
            .catch((err: string) => {
                this.showAlert(I18n.t('alert.title.error'), err);
                this.mfaInputView.clear();
                this.passwordInput.clear();
                this.confirmInput.clear();
                this.otpCode = '';
                this.password = '';
                this.confirmPass = '';
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
                [{ text: I18n.t('alert.button.ok'), style: 'cancel' }],
                { cancelable: false },
            );
        }, 100);
    }

    private checkStringBool(password: string): boolean {
        return /[A-Z]/.test(password) && /[a-z]/.test(password)
            && /[$&+,:;=?@#|'<>.^*()%!-]/.test(password)
            && /[0-9]/.test(password) && password.length >= 8;
    }

    private checkString(password: string): void {
        let hasUpper = false;
        let hasLower = false;
        let hasSymbol = false;
        let hasLimit = false;
        let hasNumber = false;
        for (let i = 0; i < password.length; i++) {
            let c = password.charAt(i);
            if (/[A-Z]/.test(c)) {
                hasUpper = true;
            }
            if (/[a-z]/.test(c)) {
                hasLower = true;
            }
            if (/[$&+,:;=?@#|'<>.^*()%!-]/.test(c)) {
                hasSymbol = true;
            }
            if (/[0-9]/.test(c)) {
                hasNumber = true;
            }
        }
        if (password.length >= 8) {
            hasLimit = true;
        }
        this.setState({
            hasUpperCase: hasUpper,
            hasLowerCase: hasLower,
            hasSymbol: hasSymbol,
            hasNumber: hasNumber,
            hasCharacterLimit: hasLimit
        });
    }

    //**************************************************************
    // Render
    //****************************************************************

    render() {
        const { forgotPasswordStore } = this.props;
        const { Popover } = renderers;
        const { visible, matchVisible } = this.state;

        return (
            <Fragment>
                <View style={styles.topSpace} />
                <Image
                    style={styles.otpImage}
                    source={require('../../../assets/image/auth/otp.png')}
                    resizeMode={'contain'} />
                <View style={styles.middleSpace1} />
                <TextFix style={cathyViews.subtitle}>
                    {forgotPasswordStore.verifyDetail.type === 'email' ?
                        I18n.t('auth.otp_email', { value: forgotPasswordStore.verifyDetail.value }) :
                        I18n.t('auth.otp_phone', { value: forgotPasswordStore.verifyDetail.value })}
                </TextFix>
                <View style={styles.middleSpace2} />
                <MfaInputView
                    ref={(mfaInputView) => this.mfaInputView = mfaInputView!}
                    onChangeCode={this.onChangeCode} />
                <View style={styles.middleSpace3} />
                <Menu name={"newPassword"}
                    renderer={Popover}
                    rendererProps={{ preferredPlacement: 'top' }}
                    opened={visible}
                    onBackdropPress={() => { this.onEndTooltipEditting() }}>
                    <MenuTrigger>
                        <CathyTextField
                            iconSource={require('../../../assets/image/icon/lock.png')}
                            password={true}>
                            <TextInput
                                ref={(textInput) => this.passwordInput = textInput!}
                                placeholder={I18n.t('placeholder.new_password')}
                                returnKeyType={'next'}
                                onSubmitEditing={this.onSubmitPassword}
                                onChangeText={this.onChangePassword} />
                        </CathyTextField>
                    </MenuTrigger>
                    <MenuOptions optionsContainerStyle={styles.tooltipTextPad}>
                        <Text>
                            <FontAwesomeIcon
                                style={this.state.hasCharacterLimit ? styles.greenCheck : styles.redCross}
                                icon={this.state.hasCharacterLimit ? faCheck : faTimes} /> {I18n.t('auth.eight_characters_long')}
                            <FontAwesomeIcon
                                style={this.state.hasUpperCase ? styles.greenCheck : styles.redCross}
                                icon={this.state.hasUpperCase ? faCheck : faTimes} /> {I18n.t('auth.upper_case')}
                            <FontAwesomeIcon
                                style={this.state.hasLowerCase ? styles.greenCheck : styles.redCross}
                                icon={this.state.hasLowerCase ? faCheck : faTimes} /> {I18n.t('auth.lower_case')}
                            <FontAwesomeIcon
                                style={this.state.hasSymbol ? styles.greenCheck : styles.redCross}
                                icon={this.state.hasSymbol ? faCheck : faTimes} /> {I18n.t('auth.special_symbol')}
                            <FontAwesomeIcon
                                style={this.state.hasNumber ? styles.greenCheck : styles.redCross}
                                icon={this.state.hasNumber ? faCheck : faTimes} /> {I18n.t('auth.number')}
                        </Text>
                    </MenuOptions>
                </Menu>
                <View style={styles.middleSpace4} />
                <CathyTextField
                    iconSource={require('../../../assets/image/icon/lock.png')}
                    password={true}>
                    <TextInput
                        ref={(textInput) => this.confirmInput = textInput!}
                        placeholder={I18n.t('placeholder.confirm_password')}
                        returnKeyType={'send'}
                        onSubmitEditing={this.onSubmitConfirmPass}
                        onChangeText={this.onChangeConfirmPass} />
                </CathyTextField>
                <View style={styles.middleSpace5} />
                {this.state.otpSent ? (
                    <TextFix style={cathyViews.countDown}>
                        {I18n.t('auth.otp_count', { count: this.state.countDown })}
                    </TextFix>
                ) : (
                        <CathyTextButton
                            text={I18n.t('auth.otp_button')}
                            onPress={this.onPressResend} />
                    )}
                <View style={styles.middleSpace6} />
                <CathyRaisedButton
                    disabled={!matchVisible}
                    text={I18n.t('auth.forgot.proceed_button')}
                    onPress={this.onPressProceed} />
                <View style={styles.bottomSpace} />
            </Fragment>
        );
    }
}

const screenHeight = Dimensions.get('screen').height;
const styles = StyleSheet.create({
    topSpace: {
        height: (screenHeight > 660 ? 72 : 64) * (screenHeight - 392) / 339,
    },
    otpImage: {
        alignSelf: 'center',
        width: 100,
        height: 96,
    },
    middleSpace1: {
        height: 12 * (screenHeight - 392) / 339,
    },
    middleSpace2: {
        height: 16 * (screenHeight - 392) / 339,
    },
    middleSpace3: {
        height: 12 * (screenHeight - 392) / 339,
    },
    middleSpace4: {
        height: 12 * (screenHeight - 392) / 339,
    },
    middleSpace5: {
        height: 12 * (screenHeight - 392) / 339,
    },
    middleSpace6: {
        height: 16 * (screenHeight - 392) / 339,
    },
    bottomSpace: {
        flex: 1, // 187
    },
    tooltipTextPad: {
        paddingTop: 10,
        paddingLeft: 15,
        paddingRight: 15,
    },
    greenCheck: {
        color: "green",
    },
    redCross: {
        color: "red"
    }
});
