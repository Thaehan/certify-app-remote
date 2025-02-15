import {
    createStackNavigator,
    StackScreenProps,
} from "@react-navigation/stack";
import React from "react";
import { SplashScreen } from "../screens/SplashScreen";
import { IntroScreen } from "../screens/intro/IntroScreen";
import AuthStackNavigator from "./AuthStackNavigator";
import MainTabNavigator from "./MainTabNavigator";
import { NavigationService } from "../navigators/NavigationService";
import { NavigationContainer } from "@react-navigation/native";

type RootStackParamList = {
    Splash: undefined;
    Intro: undefined;
    AuthStack: undefined;
    MainTab: undefined;
};

const MainStack = createStackNavigator<RootStackParamList>();

// const SplashScreen = () => {
//     return (
//         <View style={{ flex: 1, backgroundColor: "transparent" }}>
//             <Text style={{ color: "white" }}>Hello</Text>
//         </View>
//     );
// };

// const IntroScreen = () => {
//     return <Text>IntroScreen</Text>;
// };

export default function MainStackNavigator({ screenProps }: any) {
    return (
        <MainStack.Navigator
            initialRouteName="MainTab"
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: "transparent" },
                headerBackgroundContainerStyle: {
                    backgroundColor: "transparent",
                },
            }}
        >
            <MainStack.Screen name="Intro" component={IntroScreen as any} />
            <MainStack.Screen name="Splash" component={SplashScreen as any} />
            <MainStack.Screen name="AuthStack" component={AuthStackNavigator} />
            <MainStack.Screen name="MainTab" component={MainTabNavigator} />
        </MainStack.Navigator>
    );
}
