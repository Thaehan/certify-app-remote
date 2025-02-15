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
    createAppContainer,
    createSwitchNavigator,
    NavigationComponent,
} from 'react-navigation';
import { SplashScreen } from '../screens/SplashScreen';
import { IntroScreen } from '../screens/intro/IntroScreen';
import { AuthStack } from './AuthStack';
import { MainTab } from './MainTab';

interface SwitchRouteConfigMap {
    [routeName: string]: NavigationComponent;
}

const routeConfigMap: SwitchRouteConfigMap = {
    Splash: SplashScreen,
    Intro: IntroScreen,
    Auth: AuthStack,
    Main: MainTab,
  };

/**
 * Root navigator of the application
 *
 * @author Lingqi
 */
export const AppSwitch = createAppContainer(
    createSwitchNavigator(
        routeConfigMap,
  {
    initialRouteName: 'Splash',
  },
)
);
