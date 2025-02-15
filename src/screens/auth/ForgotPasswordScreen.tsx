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
import React, { Component } from 'react';
import {
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Image,
    Keyboard,
    Alert,
    BackHandler,
    StyleSheet,
    Platform,
} from 'react-native';
import { inject, observer } from 'mobx-react';
import {
    NavigationScreenProp,
    NavigationRoute,
    NavigationScreenConfig,
    NavigationEventSubscription,
    NavigationEventPayload,
} from 'react-navigation';
import { HeaderBackButton } from 'react-navigation-stack'

import LinearGradient from 'react-native-linear-gradient';
import { I18n } from '../../utils/I18n';
import { Colors } from '../../utils/Colors';
import { AllStores } from '../../stores/RootStore';
import { ForgotPasswordStore, Step } from '../../stores/ForgotPasswordStore';
import { ForgotInitialScreen } from './forgot-password/ForgotInitialScreen';
import { ForgotVerifyScreen } from './forgot-password/ForgotVerifyScreen';
import { ForgotSuccessScreen } from './forgot-password/ForgotSuccessScreen';
import { Spinner } from '../../shared-components/Spinner';
import { SafeAreaFix } from '../../shared-components/cathy/IOSFix';
import { cathyViews } from '../../shared-components/cathy/CommonViews';

interface Props {
    navigation: NavigationScreenProp<NavigationRoute>;
    forgotPasswordStore: ForgotPasswordStore;
}

/**
 * Forgot-password component, contains 3 steps, each step one child component
 *
 * @author Lingqi
 */
@inject(({ rootStore }: AllStores) => ({
    forgotPasswordStore: rootStore.forgotPasswordStore,
}))
@observer
export class ForgotPasswordScreen extends Component<Props> {

    private willFocusSubs!: NavigationEventSubscription;
    private willBlurSubs!: NavigationEventSubscription;

    private previousStep: Step;

    constructor(props: Props) {
        super(props);
        props.forgotPasswordStore.clearStates();
        this.previousStep = 'Initial';
        this.onWillFocus = this.onWillFocus.bind(this);
        this.onWillBlur = this.onWillBlur.bind(this);
        this.onBackPressed = this.onBackPressed.bind(this);
        this.onPressBackground = this.onPressBackground.bind(this);
    }

    static navigationOptions: NavigationScreenConfig<any> = ({ navigation }) => {
        const step: Step = navigation.getParam('step');
        return {
            headerLeft: step === 'Initial' || step === 'Verify' ? (
                <HeaderBackButton
                    backTitleVisible={Platform.OS === 'ios'}
                    tintColor={Platform.OS === 'android' ? Colors.unfocusedIcon : Colors.focusedIcon}
                    pressColorAndroid={Colors.blackOverlay}
                    onPress={navigation.getParam('onBackPressed')} />
            ) : (
                    undefined
                ),
        };
    }

    //**************************************************************
    // Component Lifecycle
    //****************************************************************

    componentDidMount() {
        const { navigation } = this.props;
        navigation.setParams({ onBackPressed: this.onBackPressed });
        this.willFocusSubs = navigation.addListener('willFocus', this.onWillFocus);
        this.willBlurSubs = navigation.addListener('willBlur', this.onWillBlur);
    }

    componentWillUnmount() {
        this.willFocusSubs.remove();
        this.willBlurSubs.remove();
        BackHandler.removeEventListener('hardwareBackPress', this.onBackPressed);
    }

    //**************************************************************
    // Navigation Lifecycle
    //****************************************************************

    onWillFocus(payload: NavigationEventPayload) {
        BackHandler.addEventListener('hardwareBackPress', this.onBackPressed);
    }

    onWillBlur(payload: NavigationEventPayload) {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackPressed);
    }

    //**************************************************************
    // Button Callbacks
    //****************************************************************

    private onBackPressed(): boolean {
        Keyboard.dismiss();
        const { navigation, forgotPasswordStore } = this.props;
        switch (forgotPasswordStore.step) {
            case 'Initial':
                navigation.navigate('Auth/Login');
                return true;
            case 'Verify':
                if (!forgotPasswordStore.emptyPassword) {
                    Alert.alert(
                        I18n.t('alert.title.exit'),
                        I18n.t('alert.exit_reset'),
                        [
                            { text: I18n.t('alert.button.cancel'), style: 'cancel' },
                            {
                                text: I18n.t('alert.button.exit'),
                                onPress: () => {
                                    navigation.navigate('Auth/Login');
                                    forgotPasswordStore.clearStates();
                                },
                                style: 'destructive',
                            },
                        ],
                        { cancelable: false },
                    );
                } else {
                    navigation.navigate('Auth/Login');
                    forgotPasswordStore.clearStates();
                }
                return true;
            case 'Success':
                return true;
        }
    }

    private onPressBackground(): void {
        Keyboard.dismiss();
    }

    //**************************************************************
    // Render
    //****************************************************************

    render() {
        const { forgotPasswordStore } = this.props;
        // prevent infinite re-rendering
        if (forgotPasswordStore.step !== this.previousStep) {
            this.previousStep = forgotPasswordStore.step;
            setTimeout(() => {
                this.props.navigation.setParams({
                    step: forgotPasswordStore.step
                });
            });
        }
        let forgotChildScreen;
        switch (forgotPasswordStore.step) {
            case 'Initial':
                forgotChildScreen = (
                    <ForgotInitialScreen
                        navigation={this.props.navigation} />
                );
                break;
            case 'Verify':
                forgotChildScreen = (
                    <ForgotVerifyScreen />
                );
                break;
            case 'Success':
                forgotChildScreen = (
                    <ForgotSuccessScreen
                        navigation={this.props.navigation} />
                );
                break;
        }
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
                            isVisible={forgotPasswordStore.isFetching} />
                        {forgotChildScreen}
                        <Image
                            style={cathyViews.bottomLogo}
                            source={require('../../assets/image/logo.png')} />
                    </KeyboardAvoidingView>
                </TouchableWithoutFeedback>
            </SafeAreaFix>
        );
    }
}

const styles = StyleSheet.create({
    keyboardAvoidingContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
});
