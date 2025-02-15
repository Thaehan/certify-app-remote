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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ParamListBase } from "@react-navigation/native";
import { inject, observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import { Modal, Platform, StatusBar, StyleSheet, View } from "react-native";

import {
    AndroidKeyboardMode,
    AndroidNavigationBar,
} from "../nativeUtils/NativeModules";
import { CathyTextButton } from "../shared-components/cathy/CathyButton";
import { SafeAreaFix } from "../shared-components/cathy/IOSFix";
import { AuthenticateStore } from "../stores/AuthenticateStore";
import { CallbackStore } from "../stores/CallbackStore";
import { CognitoSessionStore } from "../stores/CognitoSessionStore";
import { AllStores } from "../stores/RootStore";
import { UserPoolStore } from "../stores/UserPoolStore";
import { Colors } from "../utils/Colors";
import { Keys } from "../utils/Constants";
import { Environment } from "../utils/Environment";

interface Props extends ParamListBase {
    navigation: any;
    userPoolStore: UserPoolStore;
    sessionStore: CognitoSessionStore;
    callbackStore: CallbackStore;
    authenticateStore: AuthenticateStore;
}

/**
 * Component used as splash screen
 *
 * @author Lingqi
 */
const SplashScreen: React.FC<Props> = inject(({ rootStore }: AllStores) => ({
    userPoolStore: rootStore.userPoolStore,
    sessionStore: rootStore.cognitoSessionStore,
    callbackStore: rootStore.callbackStore,
    authenticateStore: rootStore.authenticateStore,
}))(
    observer((props) => {
        const [modalVisible, setModalVisible] = useState(false);

        const updateModalVisible = (visible: boolean) => {
            setModalVisible(visible);
            if (Platform.OS === "android") {
                const color = visible ? "#52000000" : "#00000000";
                AndroidNavigationBar.setNavigationBarColor(color);
            }
        };

        const navigateToScreen = () => {
            console.log("Navigate to screen");
            const { navigation, sessionStore, authenticateStore } = props;
            sessionStore
                .getCachedSession()
                .then(async () => {
                    let isSetupPrefer =
                        await authenticateStore.isSetPreferMethod();
                    if (isSetupPrefer) {
                        navigation.navigate("Main");
                    } else {
                        navigation.navigate("Auth/Login");
                        authenticateStore.setLoginStep("SelectPreferMethod");
                    }
                })
                .catch(() => {
                    navigation.navigate("Auth");
                });
        };

        const onDidFocus = (payload: any): void => {
            console.log("onDidFocus");
            setTimeout(() => {
                const { navigation, userPoolStore, callbackStore } = props;
                if (callbackStore.sessionId) {
                    return;
                }
                AsyncStorage.getItem(Keys.INTRO_DONE).then((isDone) => {
                    if (!JSON.parse(isDone as string)) {
                        navigation.navigate("Intro");
                        return;
                    }
                    userPoolStore.loadCachedUserPool().then((success) => {
                        if (success) {
                            navigateToScreen();
                        } else {
                            updateModalVisible(true);
                        }
                    });
                });
            }, 50);
        };

        const onPressSG = () => {
            updateModalVisible(false);
            props.userPoolStore.initUserPool(
                Environment.sg.userPoolId,
                Environment.sg.clientId,
                Environment.sg.accountId
            );
            setTimeout(() => {
                navigateToScreen();
            }, 50);
        };

        const onPressHK = () => {
            updateModalVisible(false);
            props.userPoolStore.initUserPool(
                Environment.hk.userPoolId,
                Environment.hk.clientId,
                Environment.hk.accountId
            );
            setTimeout(() => {
                navigateToScreen();
            }, 50);
        };

        const onPressAU = () => {
            updateModalVisible(false);
            props.userPoolStore.initUserPool(
                Environment.au.userPoolId,
                Environment.au.clientId,
                Environment.au.accountId
            );
            setTimeout(() => {
                navigateToScreen();
            }, 50);
        };

        useEffect(() => {
            const didFocusSubs = props.navigation.addListener(
                "focus",
                onDidFocus
            );

            // Cleanup
            return () => {
                didFocusSubs?.remove();
                if (Platform.OS === "android") {
                    if (Platform.Version >= 26) {
                        AndroidNavigationBar.setNavigationBarColor("white");
                        AndroidNavigationBar.setLightNavigationBar(true);
                    } else {
                        AndroidNavigationBar.setNavigationBarColor("black");
                    }
                    AndroidKeyboardMode.setAdjustOption("adjustPan");
                }
            };
        }, []);

        return (
            <View
                style={{
                    backgroundColor: "cyan",
                }}
            >
                <StatusBar backgroundColor={"transparent"} />
                <Modal
                    animationType={"fade"}
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {}}
                >
                    <StatusBar
                        animated={true}
                        backgroundColor={Colors.scrimColor}
                    />
                    <SafeAreaFix
                        statusBarColor={Colors.scrimColor}
                        containerColor={Colors.scrimColor}
                    >
                        <View style={styles.container}>
                            <View style={styles.selectorContainer}>
                                <CathyTextButton
                                    style={styles.sgButton}
                                    text={"Certis SG"}
                                    onPress={onPressSG}
                                />
                                <CathyTextButton
                                    style={styles.hkButton}
                                    text={"Certis HK"}
                                    onPress={onPressHK}
                                />
                                <CathyTextButton
                                    style={styles.auButton}
                                    text={"Certis AU"}
                                    onPress={onPressAU}
                                />
                            </View>
                        </View>
                    </SafeAreaFix>
                </Modal>
            </View>
        );
    })
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor:
            Platform.OS === "android" ? Colors.scrimColor : "transparent",
    },
    selectorContainer: {
        marginTop: 80,
        width: 280,
        borderRadius: 4,
        backgroundColor: "white",
        ...Platform.select({
            android: {
                elevation: 24,
                borderWidth: Number(Platform.Version) < 21 ? 1 : undefined,
                borderColor:
                    Number(Platform.Version) < 21
                        ? Colors.darkDivider
                        : undefined,
            },
            ios: {
                shadowColor: "black",
                shadowOpacity: 0.24,
                shadowRadius: 24,
                shadowOffset: {
                    width: 0,
                    height: 23,
                },
            },
        }),
    },
    sgButton: {
        marginTop: 24,
    },
    hkButton: {
        marginTop: 24,
    },
    auButton: {
        marginVertical: 24,
    },
});

export { SplashScreen };
