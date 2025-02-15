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
import React from 'react';
import {
    NavigationComponent,
    NavigationScreenConfig,
    NavigationContainer,
} from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import {
    createMaterialBottomTabNavigator
} from 'react-navigation-material-bottom-tabs';
import {
    Image,
    Platform,
    StyleSheet,
} from 'react-native';
import { I18n } from '../utils/I18n';
import { Colors } from '../utils/Colors';
import { HomeScreen } from '../screens/main/home/HomeScreen';
import { ProfileStack } from './ProfileStack';

interface BottomTabRouteConfigMap {
    [routeName: string]: {
        screen: NavigationComponent<any,any>;
        navigationOptions?: NavigationScreenConfig<any,any>;
        path?: string;
    };
}

const routeConfigMap: BottomTabRouteConfigMap = {
    'Main/Home': {
        screen: createStackNavigator({ 'Main/Home': HomeScreen }),
        navigationOptions: ({ navigation, screenProps }) => ({
            tabBarLabel: I18n.t('main.tab.home'),
            tabBarIcon: ({ tintColor }) => (
                <Image
                    style={[styles.tabBarIcon, { tintColor: tintColor! }]}
                    source={require('../assets/image/icon/apps.png')} />
            ),
            tabBarOnPress: ({ defaultHandler }) => {
                navigation.popToTop();
                defaultHandler();
            }
        }),
    },
    'Main/Profile': {
        screen: ProfileStack,
        navigationOptions: ({ navigation, screenProps }) => ({
            tabBarLabel: I18n.t('main.tab.profile'),
            tabBarIcon: ({ tintColor }) => (
                <Image
                    style={[styles.tabBarIcon, { tintColor: tintColor! }]}
                    source={require('../assets/image/icon/account.png')} />
            ),
            tabBarOnPress: ({ defaultHandler }) => {
                navigation.popToTop();
                defaultHandler();
            }
        }),
    }
};

let bottomTab: NavigationContainer;
const fixAndroidTab = Platform.OS === 'android' && Platform.Version < 21;

if (Platform.OS === 'android') {
    bottomTab = createMaterialBottomTabNavigator(
        routeConfigMap,
        {
            initialRouteName: 'Main/Home',
            order: ['Main/Home', 'Main/Profile'],
            activeTintColor: Colors.cathyBlue,
            inactiveTintColor: Colors.unfocusedIcon,
            barStyle: {
                backgroundColor: 'white',
                borderTopWidth: fixAndroidTab ? 1 : StyleSheet.hairlineWidth,
                borderColor: Colors.darkDivider
            }
        }
    );
} else {
    bottomTab = createMaterialBottomTabNavigator(
        routeConfigMap,
        {
            initialRouteName: 'Main/Home',
            order: ['Main/Home', 'Main/Profile'],
            tabBarOptions: {
                allowFontScaling: false,
                activeTintColor: Colors.cathyBlue,
                inactiveTintColor: Colors.unfocusedIcon,
                style: {
                    backgroundColor: 'white'
                },
            }
        }
    );
}

/**
 * Navigator contains top-level destinations of the app
 *
 * @author Lingqi
 */
export const MainTab = bottomTab;

const styles = StyleSheet.create({
    tabBarIcon: {
        width: 24,
        height: 24
    }
});
