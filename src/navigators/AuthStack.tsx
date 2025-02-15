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
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";
import { ActivateScreen } from "../screens/auth/ActivateScreen";
import { ForgotPasswordScreen } from "../screens/auth/ForgotPasswordScreen";
import { LoginScreen } from "../screens/auth/LoginScreen";
import TOTPVerificationScreen from "../screens/auth/mfa-setup/TotpSetupScreen";
import { SingleSignOnScreen } from "../screens/auth/SingleSignOnScreen";
import { WebScreen } from "../screens/WebScreen";
import { Colors } from "../utils/Colors";

export type AuthStackParamList = {
    "Auth/Login": undefined;
    "Auth/Forgot": undefined;
    "Auth/SSO": undefined;
    "Auth/Activate": undefined;
    "Auth/Web": undefined;
    "Auth/TOTP": undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

export function AuthStack() {
    const { t } = useTranslation();

    return (
        <Stack.Navigator
            initialRouteName="Auth/Login"
            screenOptions={{
                headerTintColor:
                    Platform.OS === "android"
                        ? Colors.unfocusedIcon
                        : Colors.focusedIcon,
                headerTransparent: true,
                headerPressColor: Colors.blackOverlay,
                headerBackTitle: t("back_button"),
                headerTitleAllowFontScaling: false,
            }}
        >
            <Stack.Screen name="Auth/Login" component={LoginScreen} />
            <Stack.Screen name="Auth/Forgot" component={ForgotPasswordScreen} />
            <Stack.Screen name="Auth/SSO" component={SingleSignOnScreen} />
            <Stack.Screen
                name="Auth/Activate"
                component={ActivateScreen}
                options={{
                    gestureEnabled: Platform.OS === "ios",
                }}
            />
            <Stack.Screen
                name="Auth/Web"
                component={WebScreen}
                options={{
                    headerTransparent: false,
                }}
            />
            <Stack.Screen name="Auth/TOTP" component={TOTPVerificationScreen} />
        </Stack.Navigator>
    );
}

export default AuthStack;
