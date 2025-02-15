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
import {
    NavigationComponent,
    NavigationScreenConfig,
} from 'react-navigation';

import { I18n } from '../utils/I18n';
import { Colors } from '../utils/Colors';
import { ProfileScreen } from '../screens/main/profile/ProfileScreen';
import { ProfilePasswordScreen } from '../screens/main/profile/ProfilePasswordScreen';
import { ProfileSettingsScreen } from '../screens/main/profile/ProfileSettingsScreen';
import { WebScreen } from '../screens/WebScreen';
import { ProfileAboutScreen } from "../screens/main/profile/ProfileAboutScreen";
import { createStackNavigator } from 'react-navigation-stack'
import SelectPreferredMFAScreen from '../screens/auth/mfa-setup/SelectPreferredMFAScreen';
import { ProfileMfaSettingsScreen } from '../screens/main/profile/ProfileMfaSettingsScreen';
import TOTPVerificationScreen from '../screens/auth/mfa-setup/TotpSetupScreen';
interface StackRouteConfigMap {
    [routeName: string]: {
        screen: NavigationComponent<any,any>;
        navigationOptions?: NavigationScreenConfig<any,any>;
        path?: string;
    };
}

const routeConfigMap: StackRouteConfigMap = {
    'Main/Profile': {
        screen: ProfileScreen,
        navigationOptions: {
            headerTransparent: true,
            headerStyle: {
                backgroundColor: 'transparent'
            }
        }
    },
    'Main/Profile/Password': {
        screen: ProfilePasswordScreen
    },
    'Main/Profile/Settings': {
        screen: ProfileSettingsScreen
    },
    'Main/Profile/Web': {
        screen: WebScreen,
    },
    'Main/Profile/About': {
        screen: ProfileAboutScreen,
    },
    'Main/Profile/MFA': {
        screen: ProfileMfaSettingsScreen,
    },

};

/**
 * Navigator of profile tab
 *
 * @author Lingqi
 */
export const ProfileStack = createStackNavigator(
    routeConfigMap,
    {
        initialRouteName: 'Main/Profile',
        headerMode: 'screen',
        defaultNavigationOptions: {
            headerTintColor: 'white',
            headerBackTitle: I18n.t('back_button'),
            headerPressColorAndroid: Colors.whiteOverlay,
            headerTitleAllowFontScaling: false,
            headerStyle: {
                backgroundColor: Colors.cathyBlue
            }
        }
    }
);
