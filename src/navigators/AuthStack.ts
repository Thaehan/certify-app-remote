/*
 * Copyright (c) 2019 Certis CISCO Security Pte Ltd
 * All rights reserved.
 *
 * This software is the confidential and proprietary information of
 * Certis CISCO Security Pte Ltd. ("Confidential Information").
 * You shall not disclose such Confidential Information and shall use
 * it only in accordance with the terms of the license agreement you
 * entered into with Certis CISCO Security Pte Ltd.
 */
import {
    NavigationComponent,
    NavigationScreenConfig,
} from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';


import { Platform } from 'react-native';
import { I18n } from '../utils/I18n';
import { Colors } from '../utils/Colors';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { SingleSignOnScreen } from '../screens/auth/SingleSignOnScreen';
import { ActivateScreen } from '../screens/auth/ActivateScreen';
import { WebScreen } from '../screens/WebScreen';
import TOTPVerificationScreen from '../screens/auth/mfa-setup/TotpSetupScreen';

interface StackRouteConfigMap {
    [routeName: string]: {
        screen: NavigationComponent<any,any>;
        navigationOptions?: NavigationScreenConfig<any,any,any>;
        path?: string;
    };
}

const routeConfigMap: StackRouteConfigMap = {
    'Auth/Login': {
        screen: LoginScreen
    },
    'Auth/Forgot': {
        screen: ForgotPasswordScreen
    },
    'Auth/SSO': {
        screen: SingleSignOnScreen
    },
    'Auth/Activate': {
        screen: ActivateScreen,
        navigationOptions: {
            gesturesEnabled: Platform.OS === 'ios'
        }
    },
    'Auth/Web': {
        screen: WebScreen,
        navigationOptions: {
            headerTransparent: false,
        },
    },
    'Auth/TOTP': {
        screen: TOTPVerificationScreen,
    }
   
};

/**
 * Auth navigator to handle login, forgot-password, single-sign-on
 *
 * @author Lingqi
 */
export const AuthStack = createStackNavigator(
    routeConfigMap,
    {
        initialRouteName: 'Auth/Login',
        headerMode: 'screen',
        // transitionConfig: () => (
        //     StackViewTransitionConfigs.SlideFromRightIOS
        // ),
        defaultNavigationOptions: {
            headerTintColor: Platform.OS === 'android' ? Colors.unfocusedIcon : Colors.focusedIcon,
            headerTransparent: true,
            headerPressColorAndroid: Colors.blackOverlay,
            headerBackTitle: I18n.t('back_button'),
            // gesturesEnabled: false,
            headerTitleAllowFontScaling: false,
        },
    },
);
