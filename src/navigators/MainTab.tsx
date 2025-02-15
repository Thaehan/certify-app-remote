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
import React from "react";
import { Image, Platform, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTranslation } from "react-i18next";
import { Colors } from "../utils/Colors";
import { HomeScreen } from "../screens/main/home/HomeScreen";
import { ProfileStackNavigator } from "./ProfileStack";

export type MainTabParamList = {
    "Main/Home": undefined;
    "Main/Profile": undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
    const { t } = useTranslation();
    const fixAndroidTab = Platform.OS === "android" && Platform.Version < 21;

    return (
        <Tab.Navigator
            initialRouteName="Main/Home"
            screenOptions={{
                tabBarActiveTintColor: Colors.cathyBlue,
                tabBarInactiveTintColor: Colors.unfocusedIcon,
                tabBarStyle: {
                    backgroundColor: "white",
                    borderTopWidth: fixAndroidTab
                        ? 1
                        : StyleSheet.hairlineWidth,
                    borderColor: Colors.darkDivider,
                },
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="Main/Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: t("main.tab.home"),
                    tabBarIcon: ({ color }) => (
                        <Image
                            style={[styles.tabBarIcon, { tintColor: color }]}
                            source={require("../assets/image/icon/apps.png")}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Main/Profile"
                component={ProfileStackNavigator}
                options={{
                    tabBarLabel: t("main.tab.profile"),
                    tabBarIcon: ({ color }) => (
                        <Image
                            style={[styles.tabBarIcon, { tintColor: color }]}
                            source={require("../assets/image/icon/account.png")}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBarIcon: {
        width: 24,
        height: 24,
    },
});
