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
import React, { useEffect, useRef, useState } from "react";
import { Linking, StatusBar, Platform, AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { inject, observer } from "mobx-react";
import * as RNLocalize from "react-native-localize";
//@ts-expect-error
import URI from "urijs";
import { AppSwitch } from "./navigators/AppSwitch";
import { NavigationService } from "./navigators/NavigationService";
import { Colors } from "./utils/Colors";
import { Keys } from "./utils/Constants";
import { RootStore, AllStores } from "./stores/RootStore";
import { UserPoolStore } from "./stores/UserPoolStore";
import { CognitoSessionStore } from "./stores/CognitoSessionStore";
import { CallbackStore } from "./stores/CallbackStore";
import { MenuProvider } from "react-native-popup-menu";
import { BiometricStore } from "./stores/BiometricStore";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import "./utils/I18n";
import { getStoredLanguage } from "./utils/I18n";

interface Props {
    rootStore: RootStore;
    userPoolStore: UserPoolStore;
    sessionStore: CognitoSessionStore;
    callbackStore: CallbackStore;
    biometricStore: BiometricStore;
}

const App: React.FC<Props> = inject(({ rootStore }: AllStores) => ({
    rootStore,
    userPoolStore: rootStore.userPoolStore,
    sessionStore: rootStore.cognitoSessionStore,
    callbackStore: rootStore.callbackStore,
    biometricStore: rootStore.biometricStore,
}))(
    observer((props) => {
        const [appState, setAppState] = useState(AppState.currentState);
        const languageCalledRef = useRef(false);
        const urlListener = useRef<any>(null);

        const handleAppStateChange = (nextAppState: string) => {
            if (
                appState.match(/inactive|background/) &&
                nextAppState === "active"
            ) {
                console.log("App has come to the foreground!");
                props.biometricStore.refreshBiometricState();
            }
            setAppState(nextAppState as any);
        };

        const handleInboundLink = (event: { url: string }): void => {
            const { userPoolStore, sessionStore, callbackStore } = props;
            NavigationService.navigate("Splash");
            const uri = new URI(event.url);
            const queryMap = uri.query(true) as { [key: string]: string };
            const data = queryMap["d"];
            const sign = queryMap["s"];
            if (data && sign) {
                callbackStore
                    .handleInboundLink(data, sign)
                    .then((query) => {
                        const userPoolId = query["ui"];
                        const clientId = query["ci"];
                        const accountId = query["ac"];
                        userPoolStore.initUserPool(
                            userPoolId,
                            clientId,
                            accountId
                        );
                        if (callbackStore.selectedApp) {
                            sessionStore
                                .getCachedSession()
                                .then(() => {
                                    callbackStore
                                        .getOutboundLink()
                                        .then((redirectUrl) => {
                                            Linking.openURL(redirectUrl).then(
                                                () => {
                                                    callbackStore.clearCallback();
                                                    NavigationService.navigate(
                                                        "Main"
                                                    );
                                                }
                                            );
                                        });
                                })
                                .catch(() => {
                                    callbackStore.clearCallback();
                                });
                        } else {
                            AsyncStorage.getItem(Keys.INTRO_DONE).then(
                                (isDone) => {
                                    if (JSON.parse(isDone as string)) {
                                        sessionStore
                                            .getCachedSession()
                                            .then(() => {
                                                NavigationService.navigate(
                                                    "Auth"
                                                );
                                            })
                                            .catch(() => {
                                                NavigationService.navigate(
                                                    "Auth"
                                                );
                                            });
                                    } else {
                                        NavigationService.navigate("Intro");
                                    }
                                }
                            );
                        }
                    })
                    .catch((reason) => {
                        console.log({ reason });
                    });
            }
        };

        const handleLanguageChange = (): void => {
            const { rootStore } = props;
            if (languageCalledRef.current) {
                return;
            }
            languageCalledRef.current = true;
            AsyncStorage.getItem(Keys.SYSTEM_LANGUAGE).then(
                (savedSystemLang) => {
                    const locales = RNLocalize.getLocales();
                    const systemLang = getStoredLanguage();
                    if (systemLang !== savedSystemLang) {
                        AsyncStorage.multiSet([
                            [Keys.SYSTEM_LANGUAGE, systemLang],
                            [Keys.LANGUAGE, systemLang],
                        ]);
                        rootStore.useLang(systemLang);
                    } else {
                        AsyncStorage.getItem(Keys.LANGUAGE).then((userLang) => {
                            rootStore.useLang(userLang || "en");
                        });
                    }
                }
            );
        };

        useEffect(() => {
            AppState.addEventListener("change", handleAppStateChange);
            urlListener.current = Linking.addEventListener(
                "url",
                handleInboundLink
            );

            Linking.getInitialURL().then((url) => {
                if (url) {
                    handleInboundLink({ url });
                }
            });

            setTimeout(() => {
                handleLanguageChange();
            }, 10);

            return () => {
                urlListener.current?.remove();
            };
        }, []);

        const statusBarFix = Platform.OS === "android" && Platform.Version < 23;

        return (
            <MenuProvider skipInstanceCheck={true}>
                <SafeAreaProvider>
                    <>
                        <StatusBar
                            translucent={Platform.OS === "ios"}
                            backgroundColor={
                                statusBarFix ? "#8BA4B2" : Colors.cathyBlueBg
                            }
                            barStyle={"dark-content"}
                        />
                        <AppSwitch />
                    </>
                    <Toast />
                </SafeAreaProvider>
            </MenuProvider>
        );
    })
);

export { App };
