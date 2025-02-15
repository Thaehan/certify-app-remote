import React from "react";
import { Platform } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { Colors } from "../utils/Colors";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { ForgotPasswordScreen } from "../screens/auth/ForgotPasswordScreen";
import { SingleSignOnScreen } from "../screens/auth/SingleSignOnScreen";
import { ActivateScreen } from "../screens/auth/ActivateScreen";
import { WebScreen } from "../screens/WebScreen";
import TOTPVerificationScreen from "../screens/auth/mfa-setup/TotpSetupScreen";
import { useTranslation } from "react-i18next";

export type AuthStackParamList = {
    "Auth/Login": undefined;
    "Auth/Forgot": undefined;
    "Auth/SSO": undefined;
    "Auth/Activate": undefined;
    "Auth/Web": undefined;
    "Auth/TOTP": undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthStackNavigator() {
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
