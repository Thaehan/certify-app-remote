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
    View,
    Text,
    StyleSheet,
    Dimensions,
    Keyboard,
    Image,
    TouchableOpacity,
} from "react-native";
import { inject, observer } from "mobx-react";
import { AuthenticateStore } from "../../../stores/AuthenticateStore";
import { AllStores } from "../../../stores/RootStore";
import { Colors } from "../../../utils/Colors";
import { NavigationRoute, NavigationScreenProp } from "react-navigation";
import I18n from "i18n-js";
import { CathyRaisedButton } from "../../../shared-components/cathy/CathyButton";

interface Props {
    authenticateStore: AuthenticateStore;
    navigation: NavigationScreenProp<NavigationRoute>;
}
interface State {
    method: "SMS" | "TOTP" | null;
}
@inject(({ rootStore }: AllStores) => ({
    authenticateStore: rootStore.authenticateStore,
}))
/**
 * 'MFA' step of login flow
 *
 * @author NganNH
 */
@observer
class SelectPreferredMFAScreen extends PureComponent<Props, State> {
    static defaultProps = {
        authenticateStore: undefined,
    };

    constructor(props: Props) {
        super(props);

        this.state = {
            method: "TOTP",
        };
        this.onPressBackground = this.onPressBackground.bind(this);
        this.setMethod = this.setMethod.bind(this);
        this.handleSelectPreferMethod =
            this.handleSelectPreferMethod.bind(this);
    }
    componentDidMount() {}

    handleSelectTOTP = async () => {
        await this.props.authenticateStore.associateSoftwareToken();
    };

    handleSelectSMS = async () => {
        await this.props.authenticateStore.selectPreferSms();
    };
    //**************************************************************
    // Button Callbacks
    //****************************************************************
    private onPressBackground(): void {
        Keyboard.dismiss();
    }
    private setMethod(method: "SMS" | "TOTP" | null): void {
        this.setState({ method: method });
    }
    private handleSelectPreferMethod(): void {
        if (this.state.method == "SMS") {
            this.handleSelectSMS();
        } else if (this.state.method == "TOTP") {
            this.handleSelectTOTP();
        }
    }
    render() {
        return (
            <>
                <View style={styles.topSpace} />
                <View style={{ flex: 1 }}>
                    <View style={styles.container}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>
                                {I18n.t("auth.select_prefer_method.title")}
                                <Text style={styles.mfaText}>
                                    {I18n.t("auth.select_prefer_method.mfa")}
                                </Text>
                            </Text>
                            <Text style={styles.subTitle}>
                                {I18n.t("auth.select_prefer_method.sub")}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => this.setMethod("SMS")}>
                            <View
                                style={[
                                    styles.preferItemContainer,
                                    this.state.method === "SMS"
                                        ? styles.preferItemContainerActive
                                        : null,
                                ]}
                            >
                                {this.state.method === "SMS" ? (
                                    <Image
                                        style={styles.radioButton}
                                        source={require("../../../assets/image/icon/radio_checked.png")}
                                        resizeMode={"contain"}
                                    />
                                ) : (
                                    <Image
                                        source={require("../../../assets/image/icon/radio_uncheck.png")}
                                        resizeMode={"contain"}
                                        style={styles.radioButton}
                                    />
                                )}
                                <View>
                                    <Image
                                        style={styles.otpImage}
                                        source={require("../../../assets/image/auth/sms.png")}
                                        resizeMode={"contain"}
                                    />
                                </View>
                                <View>
                                    <Text style={styles.smsMethodTitle}>
                                        {I18n.t(
                                            "auth.select_prefer_method.sms"
                                        )}
                                    </Text>
                                    <Text style={styles.smsMethodSub}>
                                        {I18n.t(
                                            "auth.select_prefer_method.sms_guide"
                                        )}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => this.setMethod("TOTP")}
                        >
                            <View
                                style={[
                                    styles.preferItemContainer,
                                    this.state.method === "TOTP"
                                        ? styles.preferItemContainerActive
                                        : null,
                                ]}
                            >
                                {this.state.method === "TOTP" ? (
                                    <Image
                                        style={styles.radioButton}
                                        source={require("../../../assets/image/icon/radio_checked.png")}
                                        resizeMode={"contain"}
                                    />
                                ) : (
                                    <Image
                                        source={require("../../../assets/image/icon/radio_uncheck.png")}
                                        resizeMode={"contain"}
                                        style={styles.radioButton}
                                    />
                                )}
                                <View>
                                    <Image
                                        style={styles.otpImage}
                                        source={require("../../../assets/image/auth/app-authentication.png")}
                                        resizeMode={"contain"}
                                    />
                                </View>
                                <View>
                                    <Text style={styles.smsMethodTitle}>
                                        {I18n.t(
                                            "auth.select_prefer_method.authentication_app"
                                        )}
                                    </Text>
                                    <Text style={styles.smsMethodSub}>
                                        {I18n.t(
                                            "auth.select_prefer_method.authentication_app_guide"
                                        )}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                        <View style={styles.middleSpace4} />
                        <CathyRaisedButton
                            style={styles.loginButton}
                            text="SUBMIT MFA METHOD"
                            onPress={this.handleSelectPreferMethod}
                            disabled={this.state.method == null}
                        />
                    </View>
                    <View style={styles.bottomSpace} />
                </View>
            </>
        );
    }
}

export default SelectPreferredMFAScreen;
const screenHeight = Dimensions.get("screen").height;
const styles = StyleSheet.create({
    topSpace: {
        height: (40 * (screenHeight - 222)) / 509,
    },
    middleSpace4: {
        height: (20 * (screenHeight - 300)) / 431,
        minHeight: 16,
    },
    subtitle: {
        marginTop: 8,
    },
    bottomSpace: {
        flex: 1, // 381
    },
    container: {
        backgroundColor: "white",
        margin: 20,
        padding: 20,
    },
    titleContainer: {},

    smsMethodTitle: {
        margin: 10,
        width: 200,
        fontWeight: "bold",
        marginBottom: 0,
    },
    smsMethodSub: {
        margin: 10,
        width: 150,
    },
    otpImage: {
        alignSelf: "center",
        width: 80,
        height: 80,
    },

    preferItemContainer: {
        marginVertical: 10,
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: "white",
        elevation: 5, // Add elevation for a shadow effect (Android)
        shadowColor: "#000", // Shadow color (iOS)
        shadowOffset: { width: 0, height: 2 }, // Shadow offset (iOS)
        shadowOpacity: 0.2, // Shadow opacity (iOS)
        shadowRadius: 4, // Shadow radius (iOS)
        borderRadius: 8,
        padding: 10,
    },
    preferItemContainerActive: {
        borderColor: Colors.cathyBlue,
        borderWidth: 0.5,
    },
    loginButton: {
        flexGrow: 1,
        marginHorizontal: 0,
    },
    title: {
        fontSize: 24,
        fontFamily: "Roboto-Regular",
        lineHeight: 32,
        textAlign: "left",
        color: Colors.cathyMajorText,
    },
    mfaText: {
        color: Colors.cathyBlue,
    },
    subTitle: {
        fontSize: 20,
        fontFamily: "Roboto-Regular",
        lineHeight: 32,
        textAlign: "left",
        color: Colors.cathyMajorText,
    },
    radioButton: {
        width: 24,
        height: 24,
    },
});
