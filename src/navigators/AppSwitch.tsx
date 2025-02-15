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
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { SplashScreen } from "../screens/SplashScreen";
import { IntroScreen } from "../screens/intro/IntroScreen";
import { AuthStack } from "./AuthStack";
import { MainTabNavigator } from "./MainTab";
import { NavigationService } from "./NavigationService";

export type AppSwitchParamList = {
    Splash: undefined;
    Intro: undefined;
    Auth: undefined;
    Main: undefined;
};

const Stack = createStackNavigator<AppSwitchParamList>();

export function AppSwitch() {
    return (
        <NavigationContainer ref={NavigationService.navigationRef}>
            <Stack.Navigator
                initialRouteName="Intro"
                screenOptions={{
                    headerShown: false,
                    cardStyle: { backgroundColor: "transparent" },
                }}
            >
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="Intro" component={IntroScreen} />
                <Stack.Screen name="Auth" component={AuthStack} />
                <Stack.Screen name="Main" component={MainTabNavigator} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
