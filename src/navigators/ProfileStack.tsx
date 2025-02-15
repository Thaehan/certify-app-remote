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
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { useTranslation } from "react-i18next";
import { ProfileAboutScreen } from "../screens/main/profile/ProfileAboutScreen";
import { ProfileMfaSettingsScreen } from "../screens/main/profile/ProfileMfaSettingsScreen";
import { ProfilePasswordScreen } from "../screens/main/profile/ProfilePasswordScreen";
import { ProfileScreen } from "../screens/main/profile/ProfileScreen";
import { ProfileSettingsScreen } from "../screens/main/profile/ProfileSettingsScreen";
import { WebScreen } from "../screens/WebScreen";
import { Colors } from "../utils/Colors";

export type ProfileStackParamList = {
    "Main/Profile": undefined;
    "Main/Profile/Password": undefined;
    "Main/Profile/Settings": undefined;
    "Main/Profile/Web": undefined;
    "Main/Profile/About": undefined;
    "Main/Profile/MFA": undefined;
};

const Stack = createStackNavigator<ProfileStackParamList>();

export function ProfileStackNavigator() {
    const { t } = useTranslation();

    return (
        <Stack.Navigator
            initialRouteName="Main/Profile"
            screenOptions={{
                headerTintColor: "white",
                headerBackTitle: t("back_button"),
                headerStyle: {
                    backgroundColor: Colors.cathyBlue,
                },
                headerTitleAllowFontScaling: false,
            }}
        >
            <Stack.Screen
                name="Main/Profile"
                component={ProfileScreen}
                options={{
                    headerTransparent: true,
                    headerStyle: {
                        backgroundColor: "transparent",
                    },
                }}
            />
            <Stack.Screen
                name="Main/Profile/Password"
                component={ProfilePasswordScreen}
            />
            <Stack.Screen
                name="Main/Profile/Settings"
                component={ProfileSettingsScreen}
            />
            <Stack.Screen name="Main/Profile/Web" component={WebScreen} />
            <Stack.Screen
                name="Main/Profile/About"
                component={ProfileAboutScreen}
            />
            <Stack.Screen
                name="Main/Profile/MFA"
                component={ProfileMfaSettingsScreen}
            />
        </Stack.Navigator>
    );
}
