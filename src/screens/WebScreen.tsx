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
import React, { useEffect, useRef, useState } from "react";
import {
    SafeAreaView,
    StatusBar,
    BackHandler,
    Platform,
    StyleSheet,
} from "react-native";

import { HeaderBackButton } from "@react-navigation/elements";
import { WebView, WebViewNavigation } from "react-native-webview";
import { Colors } from "../utils/Colors";
import { WebSpinner } from "../shared-components/Spinner";
import { CathyIconButton } from "../shared-components/cathy/CathyButton";
import { useNavigation, useRoute } from "@react-navigation/native";

interface Props {
    navigation: any;
}

const WebScreen: React.FC<Props> = () => {
    const webViewRef = useRef<WebView>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [canGoBack, setCanGoBack] = useState(false);
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const webUrl = route.params?.webUrl;

    const onBackPressed = (): boolean => {
        if (canGoBack && webViewRef.current) {
            webViewRef.current.goBack();
        } else {
            navigation.goBack();
        }
        return true;
    };

    const onPressClose = (): void => {
        navigation.goBack();
    };

    const onNavigationStateChange = (event: WebViewNavigation): void => {
        setCanGoBack(event.canGoBack);
        if (event.loading !== isLoading) {
            setIsLoading(event.loading);
        }
    };

    useEffect(() => {
        navigation.setParams({
            title: route.params?.title,
            headerTintColor: "white",
            headerStyle: {
                backgroundColor: Colors.cathyBlue,
            },
            headerLeft: (
                <HeaderBackButton
                    // backTitleVisible={Platform.OS === 'ios'}
                    tintColor={"white"}
                    // pressColorAndroid={Colors.whiteOverlay}
                    onPress={onBackPressed}
                />
            ),
            headerRight: (
                <CathyIconButton
                    iconSource={require("../assets/image/icon/close.png")}
                    tintColor={"white"}
                    onPress={onBackPressed}
                />
            ),
        });
    }, [route.params?.title]);

    useEffect(() => {
        navigation.setParams({
            onBackPressed,
            onPressClose,
        });

        const willFocusSubs = navigation.addListener("focus", () => {
            BackHandler.addEventListener("hardwareBackPress", onBackPressed);
        });

        const willBlurSubs = navigation.addListener("blur", () => {
            BackHandler.removeEventListener("hardwareBackPress", onBackPressed);
        });

        return () => {
            willFocusSubs?.remove?.();
            willBlurSubs?.remove?.();
            BackHandler.removeEventListener("hardwareBackPress", onBackPressed);
        };
    }, [canGoBack]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle={"light-content"}
                backgroundColor={Colors.cathyBlueDark}
            />
            <WebView
                ref={webViewRef}
                style={styles.webView}
                bounces={false}
                source={{ uri: webUrl }}
                onError={(error) => console.error("WebScreen error: ", error)}
                onLoadStart={() => setIsLoading(true)}
                onLoadEnd={() => setIsLoading(false)}
                onNavigationStateChange={onNavigationStateChange}
            />
            {isLoading && <WebSpinner />}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    webView: {
        flex: 1,
        backgroundColor: "whitesmoke",
    },
});

export { WebScreen };
