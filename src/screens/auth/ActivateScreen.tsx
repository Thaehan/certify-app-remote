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
    Image,
    TextInput,
    Keyboard,
    Alert,
    StyleSheet,
    Dimensions
} from 'react-native';
import { inject } from 'mobx-react';
import { NavigationScreenProp, NavigationRoute } from 'react-navigation';
import LinearGradient from 'react-native-linear-gradient';
import { I18n } from '../../utils/I18n';
import { Colors } from '../../utils/Colors';
import { ALL_ISO_CODES } from '../../utils/Constants';
import { AllStores } from '../../stores/RootStore';
import { UserPoolStore } from '../../stores/UserPoolStore';
import { ForgotPasswordStore } from '../../stores/ForgotPasswordStore';
import { Select } from '../../shared-components/Select';
import { Spinner } from '../../shared-components/Spinner';
import { SafeAreaFix, TextFix } from '../../shared-components/cathy/IOSFix';
import { CathyTextField } from '../../shared-components/cathy/CathyTextField';
import { CathyRaisedButton } from '../../shared-components/cathy/CathyButton';
import { cathyViews } from '../../shared-components/cathy/CommonViews';

interface Props {
    navigation: NavigationScreenProp<NavigationRoute>;
    userPoolStore: UserPoolStore;
    forgotPasswordStore: ForgotPasswordStore;
}
interface State {
    isoCode: string;
    isFetching: boolean;
}

/**
 * Component for account activation
 *
 * @author Lingqi
 */
@inject(({ rootStore }: AllStores) => ({
    userPoolStore: rootStore.userPoolStore,
    forgotPasswordStore: rootStore.forgotPasswordStore,
}))
export class ActivateScreen extends PureComponent<Props, State> {

    private username: string;

    constructor(props: Props) {
        super(props);
        this.username = '';
        this.state = {
            isoCode: this.ALL_ISO_CODES[0],
            isFetching: false,
        };
        this.onChangeUsername = this.onChangeUsername.bind(this);
        this.onSubmitUsername = this.onSubmitUsername.bind(this);
        this.onPressActivate = this.onPressActivate.bind(this);
        this.onPressBackground = this.onPressBackground.bind(this);
        this.onPickerValueChange = this.onPickerValueChange.bind(this);
    }

    private get ALL_ISO_CODES(): string[] {
        return ALL_ISO_CODES[this.props.userPoolStore.accountId];
    }

    //**************************************************************
    // TextEdit Callbacks
    //****************************************************************

    private onChangeUsername(text: string): void {
        this.username = text;
    }

    private onSubmitUsername(): void {
        this.onPressActivate();
    }

    //**************************************************************
    // Button Callbacks
    //****************************************************************

    private onPressActivate(): void {
        Keyboard.dismiss();
        if (!this.username) {
            this.showAlert(
                I18n.t('alert.title.missing'),
                I18n.t('alert.missing_id')
            );
            return;
        }
        this.setState({ isFetching: true });
        const fullName = this.state.isoCode.trim() + this.username;
        this.props.forgotPasswordStore.activate(fullName)
            .then((email) => {
                this.setState({ isFetching: false });
                this.activateSuccess(email);
            })
            .catch((reason) => {
                this.setState({ isFetching: false });
                this.showAlert(I18n.t('alert.title.error'), reason);
            });
    }

    private onPressBackground(): void {
        Keyboard.dismiss();
    }

    //**************************************************************
    // Picker Callbacks
    //****************************************************************

    private onPickerValueChange(itemValue: string, index: number): void {
        this.setState({ isoCode: itemValue });
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

    private activateSuccess(email: string): void {
        setTimeout(() => {
            Alert.alert(
                I18n.t('alert.title.success'),
                I18n.t('alert.activate_success', { email }),
                [{
                    text: I18n.t('alert.button.ok'),
                    onPress: () => {
                        this.props.navigation.navigate('Auth/Login');
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
        const { isoCode } = this.state;
        return (
            <SafeAreaFix
                statusBarColor={Colors.cathyBlueBg}
                containerColor={'white'}>
                <TouchableWithoutFeedback
                    onPress={this.onPressBackground}>
                    <KeyboardAvoidingView
                        style={styles.keyboardAvoidingContainer}
                        behavior={'padding'}
                        keyboardVerticalOffset={20}>
                        <LinearGradient
                            style={StyleSheet.absoluteFill}
                            colors={[Colors.cathyBlueBg, 'white']} />
                        <Spinner
                            isVisible={this.state.isFetching} />
                        <View style={styles.topSpace} />
                        <Image
                            style={styles.resetImage}
                            source={require('../../assets/image/auth/email.png')}
                            resizeMode={'contain'} />
                        <View style={styles.middleSpace1} />
                        <TextFix style={cathyViews.title}>
                            {I18n.t('auth.menu.activate')}
                        </TextFix>
                        <TextFix style={[cathyViews.subtitle, styles.subtitle]}>
                            {I18n.t('auth.forgot.initial_subtitle')}
                        </TextFix>
                        <View style={styles.middleSpace2} />
                        <View style={cathyViews.usernameContainer}>
                            <Select
                                style={cathyViews.userCodeSelect}
                                triggerValue={isoCode}
                                triggerTextStyle={cathyViews.userCodeTriggerText}
                                selectedValue={isoCode}
                                onValueChange={this.onPickerValueChange}>
                                {this.ALL_ISO_CODES.map((code, index) => (
                                    <Select.Item
                                        key={index}
                                        label={I18n.t('locale.' + code)}
                                        value={code}
                                        selectedColor={Colors.cathyBlue} />
                                ))}
                            </Select>
                            <CathyTextField
                                style={cathyViews.usernameField}
                                iconSource={require('../../assets/image/icon/identity.png')}>
                                <TextInput
                                    keyboardType={isoCode === 'SG' ? 'numeric' : 'default'}
                                    placeholder={'STAFF ID'}
                                    returnKeyType={'done'}
                                    onSubmitEditing={this.onSubmitUsername}
                                    onChangeText={this.onChangeUsername} />
                            </CathyTextField>
                        </View>
                        <View style={styles.middleSpace3} />
                        <CathyRaisedButton
                            text={I18n.t('auth.activate.activate_button')}
                            onPress={this.onPressActivate} />
                        <View style={styles.bottomSpace} />
                        <Image
                            style={cathyViews.bottomLogo}
                            source={require('../../assets/image/logo.png')} />
                    </KeyboardAvoidingView>
                </TouchableWithoutFeedback>
            </SafeAreaFix>
        );
    }
}

const screenHeight = Dimensions.get('screen').height;
const styles = StyleSheet.create({
    keyboardAvoidingContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    topSpace: {
        height: 100 * (screenHeight - 272) / 459,
    },
    resetImage: {
        alignSelf: 'center',
        width: 88,
        height: 88,
    },
    middleSpace1: {
        height: 28 * (screenHeight - 272) / 459,
        minHeight: 16
    },
    subtitle: {
        marginTop: 8,
    },
    middleSpace2: {
        height: 64 * (screenHeight - 272) / 459,
    },
    middleSpace3: {
        height: 48 * (screenHeight - 272) / 459,
    },
    bottomSpace: {
        flex: 1, // 219
    },
});
