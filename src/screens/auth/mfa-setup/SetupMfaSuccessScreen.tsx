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
import React, { PureComponent } from "react";
import {
    Image,
    View,
    Alert,
    Linking,
    Dimensions,
    StyleSheet,
    Text,
} from "react-native";
import { inject } from "mobx-react";
import { NavigationScreenProp, NavigationRoute } from "react-navigation";
import { I18n } from "../../../utils/I18n";
import { AllStores } from "../../../stores/RootStore";
import { CognitoSessionStore } from "../../../stores/CognitoSessionStore";
import { CallbackStore } from "../../../stores/CallbackStore";
import { AppListStore } from "../../../stores/AppListStore";
import { AuthenticateStore } from "../../../stores/AuthenticateStore";
import { BiometricStore } from "../../../stores/BiometricStore";
import { Colors } from "../../../utils/Colors";
import { CathyRaisedButton } from "../../../shared-components/cathy/CathyButton";

interface Props {
    navigation: NavigationScreenProp<NavigationRoute>;
    sessionStore: CognitoSessionStore;
    callbackStore: CallbackStore;
    appListStore: AppListStore;
    authenticateStore: AuthenticateStore;
    biometricStore: BiometricStore;
}

/**
 * 'Success' step of login flow
 *
 * @author NganNH
 */
@inject(({ rootStore }: AllStores) => ({
    sessionStore: rootStore.cognitoSessionStore,
    callbackStore: rootStore.callbackStore,
    appListStore: rootStore.appListStore,
    authenticateStore: rootStore.authenticateStore,
    biometricStore: rootStore.biometricStore,
}))
export class SetupMfaSuccessScreen extends PureComponent<Props> {
    static defaultProps = {
        authenticateStore: undefined,
        sessionStore: undefined,
        callbackStore: undefined,
        appListStore: undefined,
        biometricStore: undefined,
    };

    constructor(props: Props) {
        super(props);
        this.onFinish = this.onFinish.bind(this);
    }

    //**************************************************************
    // Component Lifecycle
    //****************************************************************

    //**************************************************************
    // Other Methods
    //****************************************************************

    private openUrl(url: string): void {
        const { navigation, callbackStore } = this.props;
        setTimeout(() => {
            Linking.openURL(url)
                .then(() => {
                    callbackStore.clearCallback();
                    navigation.navigate("Splash");
                })
                .catch(() => {
                    this.showAlert(
                        I18n.t("alert.title.error"),
                        I18n.t("error.not_installed", {
                            appName: callbackStore.appName,
                        })
                    );
                });
        }, 1000);
    }

    private showAlert(title: string, message: string): void {
        setTimeout(() => {
            Alert.alert(
                title,
                message,
                [{ text: I18n.t("alert.button.ok"), style: "cancel" }],
                { cancelable: false }
            );
        }, 100);
    }
    private onFinish() {
        const { navigation, appListStore } = this.props;
        appListStore
            .fetchAppList()
            .then()
            .catch((reason) => {
                console.log(reason);
            });
        navigation.navigate("Main/Home");
    }
    //**************************************************************
    // Render
    //****************************************************************

    render() {
        const { sessionStore, callbackStore, authenticateStore } = this.props;
        return (
            <View style={{ flex: 1, justifyContent: "center" }}>
                {/* <View style={styles.topSpace} /> */}
                <View
                    style={{
                        backgroundColor: "white",
                        margin: 20,
                        padding: 20,
                    }}
                >
                    <Image
                        style={styles.successImage}
                        source={require("../../../assets/image/icon/setup-mfa-success.png")}
                        resizeMode={"contain"}
                    />
                    <View style={styles.middleSpace1} />
                    <View>
                        <Text style={styles.mainTitle}>
                            {I18n.t("auth.mfa.success_title")}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.subtitle}>
                            {authenticateStore.mfaSetupType == "SMS"
                                ? I18n.t("auth.mfa.mfa_setup_sms_successfully")
                                : I18n.t(
                                      "auth.mfa.mfa_setup_totp_successfully"
                                  )}
                        </Text>
                    </View>
                    <View style={styles.bottomSpace} />
                    <View style={styles.submitContainer}>
                        <CathyRaisedButton
                            style={styles.loginButton}
                            text="Finish"
                            onPress={this.onFinish}
                        />
                    </View>
                </View>
            </View>
        );
    }
}

const screenHeight = Dimensions.get("screen").height;
const styles = StyleSheet.create({
    topSpace: {
        height: (40 * (screenHeight - 222)) / 509,
    },
    successImage: {
        alignSelf: "center",
        width: 100,
        height: 100,
    },
    middleSpace1: {
        height: (28 * (screenHeight - 222)) / 509,
        minHeight: 16,
    },
    subtitle: {
        marginTop: 8,
        textAlign: "center",
    },
    bottomSpace: {
        flex: 1, // 381
    },
    mainTitle: {
        fontSize: 28,
        fontFamily: "Roboto-Regular",
        lineHeight: 32,
        textAlign: "center",
        color: Colors.cathyMajorText,
    },
    loginButton: {
        flexGrow: 1,
        marginHorizontal: 0,
    },
    submitContainer: {
        marginVertical: 20,
    },
});
