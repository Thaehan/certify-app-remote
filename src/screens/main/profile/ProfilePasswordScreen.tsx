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
import React, { PureComponent } from 'react';
import {
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    View,
    Text,
    Image,
    TextInput,
    Keyboard,
    Alert,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { inject } from 'mobx-react';
import {
    NavigationScreenProp,
    NavigationRoute,
    NavigationScreenConfig,
    NavigationStackScreenOptions,
} from 'react-navigation';
import { I18n } from '../../../utils/I18n';
import { AllStores } from '../../../stores/RootStore';
import { CognitoSessionStore } from '../../../stores/CognitoSessionStore';
import { Spinner } from '../../../shared-components/Spinner';
import { CathyTextField } from '../../../shared-components/cathy/CathyTextField';
import { CathyRaisedButton } from '../../../shared-components/cathy/CathyButton';
import { Menu, renderers, MenuTrigger, MenuOptions, MenuProvider } from 'react-native-popup-menu';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'

interface Props {
    navigation: NavigationScreenProp<NavigationRoute>;
    sessionStore: CognitoSessionStore;
}
interface State {
    isFetching: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasCharacterLimit: boolean;
    hasSymbol: boolean;
    hasNumber: boolean;
    visible: boolean;
    matchVisible: boolean;
}

@inject(({ rootStore }: AllStores) => ({
    sessionStore: rootStore.cognitoSessionStore,
}))
export class ProfilePasswordScreen extends PureComponent<Props, State> {

    private oldPasswordInput!: TextInput;
    private newPasswordInput!: TextInput;
    private confirmPasswordInput!: TextInput;

    private oldPassword: string;
    private newPassword: string;
    private confirmPassword: string;
    private keyboardDidHideListener: any;

    constructor(props: Props) {
        super(props);
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.state = {
            isFetching: false,
            hasUpperCase: false,
            hasLowerCase: false,
            hasCharacterLimit: false,
            hasSymbol: false,
            hasNumber: false,
            visible: false,
            matchVisible: false
        };
        this.onChangeOldPassword = this.onChangeOldPassword.bind(this);
        this.onChangeNewPassword = this.onChangeNewPassword.bind(this);
        this.onChangeConfirmPassword = this.onChangeConfirmPassword.bind(this);
        this.onSubmitOldPassword = this.onSubmitOldPassword.bind(this);
        this.onSubmitNewPassword = this.onSubmitNewPassword.bind(this);
        this.onSubmitConfirmPassword = this.onSubmitConfirmPassword.bind(this);
        this.onPressUpdate = this.onPressUpdate.bind(this);
        this.onPressBackground = this.onPressBackground.bind(this);
        this._keyboardDidHide = this._keyboardDidHide.bind(this);
    }

    static navigationOptions: NavigationScreenConfig<NavigationStackScreenOptions> = ({ navigation }) => {
        return {
            title: I18n.t('profile.item.password'),
        };
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

    private onChangeOldPassword(text: string): void {
        if (text && this.newPassword === this.confirmPassword 
            && this.newPassword.length > 0) {
            this.setState({
                matchVisible: true,
            });
        } else {
            this.setState({
                matchVisible: false,
            });
        }
        this.oldPassword = text;
    }

    private onChangeNewPassword(text: string): void {
        if (!this.state.visible && this.newPasswordInput.isFocused()) {
            this.setState({
                visible: true,
            });
        }
        this.checkString(text);
        if (this.checkStringBool(text)) {
            if (text === this.confirmPassword && this.oldPassword) {
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
        this.newPassword = text;
    }

    private onChangeConfirmPassword(text: string): void {
        if (text === this.newPassword && this.oldPassword) {
            this.setState({
                matchVisible: true,
            });
        } else {
            this.setState({
                matchVisible: false,
            });
        }
        this.confirmPassword = text;
    }

    private onSubmitOldPassword(): void {
        this.newPasswordInput.focus();
    }

    private onSubmitNewPassword(): void {
        this.confirmPasswordInput.focus();
    }

    private onSubmitConfirmPassword(): void {
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
        if (!this.oldPassword) {
            this.showAlert(
                I18n.t('alert.title.missing'),
                I18n.t('alert.missing_old_password')
            );
            return;
        }
        if (!this.newPassword || !this.confirmPassword) {
            this.showAlert(
                I18n.t('alert.title.missing'),
                I18n.t('alert.missing_password')
            );
            return;
        }
        if (this.newPassword !== this.confirmPassword) {
            this.showAlert(
                I18n.t('alert.title.error'),
                I18n.t('alert.password_match')
            );
            return;
        }
        this.setState({ isFetching: true });
        this.props.sessionStore.changePassword(this.oldPassword, this.newPassword)
            .then((result) => {
                this.setState({ isFetching: false });
                if (result === 'SUCCESS') {
                    this.changePasswordSuccess();
                }
            })
            .catch((err) => {
                this.setState({ isFetching: false });
                this.showAlert(I18n.t('alert.title.error'), err);
            });
    }

    private onPressBackground(): void {
        Keyboard.dismiss();
    }

    private passwordCheck(): boolean {
        return !this.state.hasUpperCase || !this.state.hasLowerCase ||
            !this.state.hasNumber || !this.state.hasSymbol ||
            !this.state.hasCharacterLimit;
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

    private changePasswordSuccess(): void {
        this.oldPasswordInput.clear();
        this.newPasswordInput.clear();
        this.confirmPasswordInput.clear();
        setTimeout(() => {
            Alert.alert(
                I18n.t('alert.title.success'),
                I18n.t('alert.password_success'),
                [{
                    text: I18n.t('alert.button.ok'),
                    onPress: () => {
                        this.props.navigation.navigate('Main/Profile');
                    },
                    style: 'cancel',
                }],
                { cancelable: false },
            );
        }, 100);
    }

    //**************************************************************
    // Render
    //****************************************************************

    render() {
        const { Popover } = renderers;
        const { visible, matchVisible } = this.state;

        return (
            <TouchableWithoutFeedback
                onPress={this.onPressBackground}>
                <KeyboardAvoidingView
                    style={styles.keyboardAvoidingContainer}
                    behavior={'padding'}
                    keyboardVerticalOffset={80}>
                    <Spinner
                        isVisible={this.state.isFetching} />
                    <View style={styles.topSpace} />
                    <CathyTextField
                        iconSource={require('../../../assets/image/icon/lock.png')}
                        password={true}>
                        <TextInput
                            ref={(textInput) => this.oldPasswordInput = textInput!}
                            placeholder={I18n.t('placeholder.old_password')}
                            returnKeyType={'next'}
                            onSubmitEditing={this.onSubmitOldPassword}
                            onChangeText={this.onChangeOldPassword} />
                    </CathyTextField>
                    <View style={styles.middleSpace1} />
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
                                    ref={(textInput) => this.newPasswordInput = textInput!}
                                    placeholder={I18n.t('placeholder.new_password')}
                                    returnKeyType={'next'}
                                    onSubmitEditing={this.onSubmitNewPassword}
                                    onChangeText={this.onChangeNewPassword} />
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
                        <View style={styles.middleSpace2} />
                    </Menu>
                    <CathyTextField
                        iconSource={require('../../../assets/image/icon/lock.png')}
                        password={true}>
                        <TextInput
                            ref={(textInput) => this.confirmPasswordInput = textInput!}
                            placeholder={I18n.t('placeholder.confirm_password')}
                            returnKeyType={'send'}
                            onSubmitEditing={this.onSubmitConfirmPassword}
                            onChangeText={this.onChangeConfirmPassword} />
                    </CathyTextField>
                    <View style={styles.middleSpace3} />
                    <CathyRaisedButton
                        disabled={!matchVisible}
                        text={I18n.t('auth.login.update_button')}
                        onPress={this.onPressUpdate} />
                    <View style={styles.bottomSpace} />
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        );
    }
}

const screenHeight = Dimensions.get('screen').height;
const styles = StyleSheet.create({
    keyboardAvoidingContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'whitesmoke'
    },
    topSpace: {
        height: 64 * (screenHeight - 296) / 435,
    },
    middleSpace1: {
        height: 36 * (screenHeight - 296) / 435,
    },
    middleSpace2: {
        height: 24 * (screenHeight - 296) / 435,
    },
    middleSpace3: {
        height: 48 * (screenHeight - 296) / 435,
    },
    bottomSpace: {
        flex: 1, // 263
    },
    tooltipTextPad: {
        paddingTop: 10,
        paddingLeft: 15,
        paddingRight: 15
    },
    greenCheck: {
        color: "green",
    },
    redCross: {
        color: "red"
    }
});
