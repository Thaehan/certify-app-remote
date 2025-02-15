import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import MainStackNavigator from "./MainStackNavigator";
import { NavigationService } from "../navigators/NavigationService";

export default function AppNavigation() {
    return (
        <NavigationContainer ref={NavigationService.navigationRef}>
            <MainStackNavigator />
        </NavigationContainer>
    );
}
