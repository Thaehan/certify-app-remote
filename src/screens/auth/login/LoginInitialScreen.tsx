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
    Fragment,
    Component,
} from 'react';
import {
    View,
    Text,
    TextInput,
    Keyboard,
    Alert,
    Dimensions,
    StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { inject } from 'mobx-react';
import {
    NavigationScreenProp,
    NavigationRoute,
    NavigationEventSubscription,
    NavigationEventPayload
} from 'react-navigation';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faFingerprint } from '@fortawesome/free-solid-svg-icons';
import {  BuildVariant } from '../../../nativeUtils/NativeModules';
import { AppVersion } from "../../../utils/Constants";
import { I18n } from '../../../utils/I18n';
import { Colors } from '../../../utils/Colors';
import {
    ALL_ISO_CODES,
    ACCOUNT_NAMES,
    Keys,
} from '../../../utils/Constants';
import { AllStores } from '../../../stores/RootStore';
import { UserPoolStore } from '../../../stores/UserPoolStore';
import { AuthenticateStore } from '../../../stores/AuthenticateStore';
import { CallbackStore } from '../../../stores/CallbackStore';
import { Select } from '../../../shared-components/Select';
import { TextFix } from '../../../shared-components/cathy/IOSFix';
import { CathyTextField } from '../../../shared-components/cathy/CathyTextField';
import {
    CathyRaisedButton,
    CathyTextButton,
} from '../../../shared-components/cathy/CathyButton';
import { cathyViews } from '../../../shared-components/cathy/CommonViews';
import { BIOMETRICS_RETRIEVE_ERROR, BiometricStore } from '../../../stores/BiometricStore';
import { MaterialButton } from "../../../shared-components/MaterialButton";

interface Props {
    navigation: NavigationScreenProp<NavigationRoute>;
    userPoolStore: UserPoolStore;
    authenticateStore: AuthenticateStore;
    callbackStore: CallbackStore;
    biometricStore: BiometricStore;
    accountId : string
}
interface State {
    isoCode: string;
    username: string;
    password: string;
    listIsoCode:string [];
}

/**
 * 'Initial' step of login flow
 *
 * @author Lingqi
 */
@inject(({ rootStore }: AllStores) => ({
    userPoolStore: rootStore.userPoolStore,
    authenticateStore: rootStore.authenticateStore,
    callbackStore: rootStore.callbackStore,
    biometricStore: rootStore.biometricStore
}))

export class LoginInitialScreen extends Component<Props, State> {

    static defaultProps = {
        userPoolStore: undefined,
        authenticateStore: undefined,
        callbackStore: undefined,
        biometricStore: undefined
    };
    private willFocusSubs!: NavigationEventSubscription;
    private usernameInput!: TextInput;
    private passwordInput!: TextInput;

    constructor(props: Props) {
        super(props);
        this.state = {
            isoCode: '',
            username: '',
            password: '',
            listIsoCode : []
        };
        this.onWillFocus = this.onWillFocus.bind(this);
        this.onChangeUsername = this.onChangeUsername.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);
        this.onSubmitUsername = this.onSubmitUsername.bind(this);
        this.onSubmitPassword = this.onSubmitPassword.bind(this);
        this.onPressLogin = this.onPressLogin.bind(this);
        this.onPressBiometrics = this.onPressBiometrics.bind(this);
        this.onPressForgot = this.onPressForgot.bind(this);
        this.onPickerValueChange = this.onPickerValueChange.bind(this);
    }

    //**************************************************************
    // Component Lifecycle
    //****************************************************************

    componentDidMount() {
        const { navigation } = this.props;
        this.willFocusSubs = navigation.addListener('willFocus', this.onWillFocus);
        if(this.props.userPoolStore && this.props.userPoolStore.accountId){
            this.setState({
                listIsoCode : ALL_ISO_CODES[this.props.userPoolStore.accountId],
                isoCode : ALL_ISO_CODES[this.props.userPoolStore.accountId][0]})
              
        }
        
        AsyncStorage.getItem(Keys.USERNAME).then((username) => {
            if (username) {
                this.setState({ username });
            }
        });
    }

    componentWillUnmount() {
        this.willFocusSubs.remove();
    }

    componentDidUpdate(prevProps:Props, prevState: State) {
        const prevIsBioReady = prevProps.biometricStore.isBioReady;
        const currIsBioReady = this.props.biometricStore.isBioReady;
        const { navigation } = this.props;
        const isSignOut:boolean = navigation.getParam('isSignOut', false);
        if (currIsBioReady != prevIsBioReady) {
            if (currIsBioReady && !isSignOut) {
                this.onPressBiometrics();
            }
        }
        if(prevProps.accountId != this.props.accountId){
            this.setState({
                listIsoCode : ALL_ISO_CODES[this.props.accountId],
                isoCode : ALL_ISO_CODES[this.props.accountId][0]})
        }
    }
    //**************************************************************
    // Navigation Lifecycle
    //****************************************************************

    onWillFocus(payload: NavigationEventPayload) {
        const { biometricStore, navigation } = this.props;
        const isSignOut:boolean = navigation.getParam('isSignOut', false);
        if(biometricStore.isBioReady && !isSignOut) {
            this.onPressBiometrics();
        }
    }

    //**************************************************************
    // TextEdit Callbacks
    //****************************************************************

    private onChangeUsername(text: string): void {
        this.setState({ username: text });
    }

    private onChangePassword(text: string): void {
        this.setState({ password: text });
    }

    private onSubmitUsername(): void {
        this.passwordInput.focus();
    }

    private onSubmitPassword(): void {
        this.onPressLogin();
    }

    //**************************************************************
    // Button Callbacks
    //****************************************************************

    private async onPressLogin() {
        Keyboard.dismiss();
        const { username, password } = this.state;
        if (!username || !password) {
            this.showAlert(
                I18n.t('alert.title.missing'),
                I18n.t('alert.missing_id_password')
            );
            return;
        }
        AsyncStorage.setItem(Keys.USERNAME, username);
        const fullName = this.state.isoCode.trim() + username;
        const appId = this.props.callbackStore.appId;
        await this.props.authenticateStore.authenticateUser(fullName, password, appId)
            .then(()=>{
            })
            .catch((err: string) => {
                this.showAlert(I18n.t('alert.title.error'), err);
                this.setState({ password: '' });
            });
            if (this.props.authenticateStore.loginStep == "Success") {
               
              } else {
                // Handle login failure
              }
    }

    private onPressBiometrics(): void {
        const appId = this.props.callbackStore.appId;
        this.props.authenticateStore.authenticateUserBiometrics(appId)
            .then()
            .catch((err: string) => {
                if (err == BIOMETRICS_RETRIEVE_ERROR) {
                }
                else {
                    this.showAlert(I18n.t('alert.title.error'), err);
                }
            });
    }

    private onPressForgot(): void {
        Keyboard.dismiss();
        this.props.navigation.navigate('Auth/Forgot');
    }

    //**************************************************************
    // Other Methods
    //****************************************************************

    private onPickerValueChange(itemValue: string, index: number): void {
        this.setState({ isoCode: itemValue });
    }

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

    //**************************************************************
    // Render
    //****************************************************************

    render() {
        const { userPoolStore, callbackStore, biometricStore ,authenticateStore} = this.props;
        const { isoCode } = this.state;
        const isBioButtonDisabled = !biometricStore.isBioReady || biometricStore.isLockedOut;
        return (
            <Fragment>
                <View style={styles.topSpace} />
                <TextFix style={cathyViews.largeTitle}>
                    {I18n.t('auth.login.initial_title')}
                </TextFix>
                <TextFix style={[cathyViews.subtitle, styles.subtitle]}>
                    {I18n.t('auth.login.initial_subtitle', { appName: callbackStore.sessionId ?
                        callbackStore.appName : ACCOUNT_NAMES[userPoolStore.accountId] })}
                </TextFix>
                <View style={styles.middleSpace1} />
                <View style={cathyViews.usernameContainer}>
                    <Select
                        style={cathyViews.userCodeSelect}
                        triggerValue={isoCode}
                        triggerTextStyle={cathyViews.userCodeTriggerText}
                        selectedValue={isoCode}
                        onValueChange={this.onPickerValueChange}>
                        {this.state.listIsoCode.map((code, index) => (
                            <Select.Item
                                key={index}
                                label={I18n.t('locale.' + code)}
                                value={code}
                                selectedColor={Colors.cathyBlue} />
                        ))}
                    </Select>
                    <CathyTextField
                        style={cathyViews.usernameField}
                        iconSource={require('../../../assets/image/icon/identity.png')}>
                        <TextInput
                            ref={(textInput) => this.usernameInput = textInput!}
                            keyboardType={isoCode === 'SG' ? 'numeric' : 'default'}
                            value={this.state.username}
                            placeholder={I18n.t('placeholder.id')}
                            returnKeyType={'done'}
                            onSubmitEditing={this.onSubmitUsername}
                            onChangeText={this.onChangeUsername} />
                    </CathyTextField>
                </View>
                <View style={styles.middleSpace2} />
                <CathyTextField
                    iconSource={require('../../../assets/image/icon/lock.png')}
                    password={true}>
                    <TextInput
                        ref={(textInput) => this.passwordInput = textInput!}
                        value={this.state.password}
                        placeholder={I18n.t('placeholder.password')}
                        returnKeyType={'send'}
                        onSubmitEditing={this.onSubmitPassword}
                        onChangeText={this.onChangePassword} />
                </CathyTextField>
                <View style={styles.middleSpace3} />
                <View style={styles.loginButtonsContainer}>
                    <CathyRaisedButton
                        style={styles.loginButton}
                        text={I18n.t('auth.login.login_button')}
                        onPress={this.onPressLogin} />
                    { biometricStore.bioSetupDoneBefore && (
                        <MaterialButton
                            rippleColor={Colors.blackOverlay}
                            style={[styles.iconButton, isBioButtonDisabled ? styles.iconButtonDisabled : {}]}
                            contentStyle={styles.iconButtonContent}
                            onPress={this.onPressBiometrics}
                            disabled={isBioButtonDisabled}
                        >
                            <FontAwesomeIcon icon={faFingerprint} size={28} style={styles.iconButtonIcon}></FontAwesomeIcon>
                        </MaterialButton>
                    )}
                </View>
                <View style={styles.middleSpace4} />
                <CathyTextButton
                    text={I18n.t('auth.login.forgot_button')}
                    onPress={this.onPressForgot} />
                <View style={styles.bottomSpace} />
                {/* <Text style={styles.versionText}>
                    {AppVersion.version +
                    (BuildVariant.buildType === 'release' ? '' : ` (${BuildVariant.buildType})`)}
                </Text> */}
            </Fragment>
        );
    }
}

const screenHeight = Dimensions.get('screen').height;
const styles = StyleSheet.create({
    topSpace: {
        height: 88 * (screenHeight - 300) / 431,
    },
    subtitle: {
        marginTop: 8,
    },
    middleSpace1: {
        height: 64 * (screenHeight - 300) / 431,
    },
    middleSpace2: {
        height: 20 * (screenHeight - 300) / 431,
        minHeight: 16,
        maxHeight: 24,
    },
    middleSpace3: {
        height: 48 * (screenHeight - 300) / 431,
    },
    middleSpace4: {
        height: 20 * (screenHeight - 300) / 431,
        minHeight: 16
    },
    bottomSpace: {
        flex: 1, // 191
    },
    loginButtonsContainer: {
      flexDirection: 'row'
    },
    versionText: {
       textAlign : 'center',
       marginBottom: 15,
        fontSize: 12,
        fontFamily: 'Roboto-Regular',
        letterSpacing: 0.4,
        lineHeight: 16,
        color: 'white',
    },
    iconButton: {
        flexDirection: 'row',
        backgroundColor: Colors.cathyOrange,
        marginRight: 24,
        marginLeft: 5,
        height: 48,
        width: 48,
        borderRadius: 4
    },
    iconButtonDisabled: {
        backgroundColor: Colors.cathyGrey
    },
    iconButtonContent: {
        margin: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    iconButtonIcon: {
        color: 'white',
    },
    loginButton: {
        flexGrow: 1,
    },
});
