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
    Text,
    TextInput,
    Keyboard,
    Alert,
    Dimensions,
    StyleSheet,
} from 'react-native';
import { inject } from 'mobx-react';
import { I18n } from '../../../utils/I18n';
import { AllStores } from '../../../stores/RootStore';
import { AuthenticateStore } from '../../../stores/AuthenticateStore';
import { TextFix } from '../../../shared-components/cathy/IOSFix';
import { CathyTextField } from '../../../shared-components/cathy/CathyTextField';
import { CathyRaisedButton } from '../../../shared-components/cathy/CathyButton';
import { cathyViews } from '../../../shared-components/cathy/CommonViews';
import { Menu, renderers, MenuTrigger, MenuOptions, MenuProvider } from 'react-native-popup-menu';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';

interface Props {
    authenticateStore: AuthenticateStore;
}

interface State {
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasCharacterLimit: boolean;
    hasSymbol: boolean;
    hasNumber: boolean;
    visible: boolean;
    matchVisible: boolean;
}

/**
 * 'TempPassword' step of login flow
 *
 * @author Lingqi
 */
@inject(({ rootStore }: AllStores) => ({
    authenticateStore: rootStore.authenticateStore,
}))
export class LoginTempPasswordScreen extends PureComponent<Props, State> {

    static defaultProps = {
        authenticateStore: undefined
    };

    private passwordInput!: TextInput;
    private confirmInput!: TextInput;

    private password: string;
    private confirmPass: string;
    private keyboardDidHideListener: any;

    constructor(props: Props, ctx: any) {
        super(props, ctx);
        this.password = '';
        this.confirmPass = '';
        this.state = {
            hasUpperCase: false,
            hasLowerCase: false,
            hasCharacterLimit: false,
            hasSymbol: false,
            hasNumber: false,
            visible: false,
            matchVisible: false
        };
        this.onChangePassword = this.onChangePassword.bind(this);
        this.onChangeConfirmPass = this.onChangeConfirmPass.bind(this);
        this.onSubmitPassword = this.onSubmitPassword.bind(this);
        this.onSubmitConfirmPass = this.onSubmitConfirmPass.bind(this);
        this.onPressUpdate = this.onPressUpdate.bind(this);
        this._keyboardDidHide = this._keyboardDidHide.bind(this);
    }

    //**************************************************************
    // Component Lifecycle
    //****************************************************************

    componentDidMount() {
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
    }

    componentWillUnmount() {
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
        this.props.authenticateStore.emptyPasswordCheck(text);
        if (!this.state.visible && this.passwordInput.isFocused()) {
            this.setState({
                visible: true,
            });
        }
        this.checkString(text);
        if (this.checkStringBool(text)) {
            if (text === this.confirmPass) {
                this.setState({
                    matchVisible: true,
                });
            } else {
                this.setState({
                    matchVisible: false,
                });
            }
            this.onEndTooltipEditting();
        }
        this.password = text;
    }

    private onChangeConfirmPass(text: string): void {
        if (text === this.password) {
            this.setState({
                matchVisible: true,
            })
        } else {
            this.setState({
                matchVisible: false,
            })
        }
        this.confirmPass = text;
    }

    private onSubmitPassword(): void {
        this.confirmInput.focus();
    }

    private onSubmitConfirmPass(): void {
        this.onPressUpdate();
    }

    private onEndTooltipEditting(): void {
        this.setState({
            visible: false,
        });
    }

    //**************************************************************
    // Button Callbacks
    //****************************************************************

    private onPressUpdate(): void {
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
        this.props.authenticateStore.changeTempPassword(this.password)
            .then()
            .catch((err: string) => {
                this.showAlert(I18n.t('alert.title.error'), err);
            });
    }

    private passwordCheck(): boolean {
        return !this.state.hasUpperCase || !this.state.hasLowerCase ||
            !this.state.hasNumber || !this.state.hasSymbol ||
            !this.state.hasCharacterLimit;
    }

    private shouldDisableProceed(): boolean {
        return this.passwordCheck() || (this.confirmPass !== this.password);
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
        })
    }

    //**************************************************************
    // Render
    //****************************************************************

    render() {
        const { Popover } = renderers;
        const { visible, matchVisible } = this.state;

        return (
            <Fragment>
                <View style={styles.topSpace} />
                <Image
                    style={styles.authImage}
                    source={require('../../../assets/image/auth/auth.png')}
                    resizeMode={'contain'} />
                <View style={styles.middleSpace1} />
                <TextFix style={cathyViews.title}>
                    {I18n.t('profile.item.password')}
                </TextFix>
                <View style={styles.middleSpace2} />
                <Menu name={"newPassword"} renderer={Popover} rendererProps={{ preferredPlacement: 'top' }} opened={visible}
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
                <View style={styles.middleSpace3} />
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
                <View style={styles.middleSpace4} />
                <CathyRaisedButton
                    disabled={!matchVisible}
                    text={I18n.t('auth.login.update_button')}
                    onPress={this.onPressUpdate} />
                <View style={styles.bottomSpace} />
            </Fragment>
        );
    }
}

const screenHeight = Dimensions.get('screen').height;
const styles = StyleSheet.create({
    topSpace: {
        height: (screenHeight > 660 ? 84 : 64) * (screenHeight - 312) / 419,
    },
    authImage: {
        alignSelf: 'center',
        width: 96,
        height: 96,
    },
    middleSpace1: {
        height: (screenHeight > 660 ? 20 : 16) * (screenHeight - 312) / 419,
        minHeight: 12,
        maxHeight: 24
    },
    middleSpace2: {
        height: (screenHeight > 660 ? 32 : 24) * (screenHeight - 312) / 419,
        minHeight: 20
    },
    middleSpace3: {
        height: (screenHeight > 660 ? 20 : 16) * (screenHeight - 312) / 419,
        minHeight: 12,
        maxHeight: 24
    },
    middleSpace4: {
        height: 44 * (screenHeight - 312) / 419,
    },
    bottomSpace: {
        flex: 1, // 219
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
