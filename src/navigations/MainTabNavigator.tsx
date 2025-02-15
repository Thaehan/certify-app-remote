import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Image, Platform, StyleSheet } from "react-native";
import { Colors } from "../utils/Colors";
import { HomeScreen } from "../screens/main/home/HomeScreen";
import { ProfileStackNavigator } from "../navigators/ProfileStack";
import { useTranslation } from "react-i18next";

export type MainTabParamList = {
    "Main/Home": undefined;
    "Main/Profile": undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
    const fixAndroidTab = Platform.OS === "android" && Platform.Version < 21;

    const { t } = useTranslation();

    return (
        <Tab.Navigator
            initialRouteName="Main/Home"
            activeColor={Colors.cathyBlue}
            inactiveColor={Colors.unfocusedIcon}
            barStyle={{
                backgroundColor: "white",
                borderTopWidth: fixAndroidTab ? 1 : StyleSheet.hairlineWidth,
                borderColor: Colors.darkDivider,
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
