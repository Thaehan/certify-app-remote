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
import { inject, observer } from "mobx-react";
import React, { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Dimensions,
    Image,
    Keyboard,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { CathyRaisedButton } from "../../../shared-components/cathy/CathyButton";
import { AuthenticateStore } from "../../../stores/AuthenticateStore";
import { AllStores } from "../../../stores/RootStore";
import { Colors } from "../../../utils/Colors";

interface Props {
    authenticateStore: AuthenticateStore;
    navigation: any;
}

type MFAMethod = "SMS" | "TOTP" | null;

/**
 * 'MFA' step of login flow
 *
 * @author NganNH
 */
const SelectPreferredMFAScreen: FC<Props> = inject(
    ({ rootStore }: AllStores) => ({
        authenticateStore: rootStore.authenticateStore,
    })
)(
    observer(({ authenticateStore }) => {
        const { t } = useTranslation();
        const [method, setMethod] = useState<MFAMethod>("TOTP");

        const handleSelectTOTP = async (): Promise<void> => {
            await authenticateStore.associateSoftwareToken();
        };

        const handleSelectSMS = async (): Promise<void> => {
            await authenticateStore.selectPreferSms();
        };

        const onPressBackground = (): void => {
            Keyboard.dismiss();
        };

        const handleSelectPreferMethod = (): void => {
            if (method === "SMS") {
                handleSelectSMS();
            } else if (method === "TOTP") {
                handleSelectTOTP();
            }
        };

        return (
            <>
                <View style={styles.topSpace} />
                <View style={{ flex: 1 }}>
                    <View style={styles.container}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>
                                {t("auth.select_prefer_method.title")}
                                <Text style={styles.mfaText}>
                                    {t("auth.select_prefer_method.mfa")}
                                </Text>
                            </Text>
                            <Text style={styles.subTitle}>
                                {t("auth.select_prefer_method.sub")}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => setMethod("SMS")}>
                            <View
                                style={[
                                    styles.preferItemContainer,
                                    method === "SMS"
                                        ? styles.preferItemContainerActive
                                        : null,
                                ]}
                            >
                                <Image
                                    style={styles.radioButton}
                                    source={
                                        method === "SMS"
                                            ? require("../../../assets/image/icon/radio_checked.png")
                                            : require("../../../assets/image/icon/radio_uncheck.png")
                                    }
                                    resizeMode={"contain"}
                                />
                                <View>
                                    <Image
                                        style={styles.otpImage}
                                        source={require("../../../assets/image/auth/sms.png")}
                                        resizeMode={"contain"}
                                    />
                                </View>
                                <View>
                                    <Text style={styles.smsMethodTitle}>
                                        {t("auth.select_prefer_method.sms")}
                                    </Text>
                                    <Text style={styles.smsMethodSub}>
                                        {t(
                                            "auth.select_prefer_method.sms_guide"
                                        )}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setMethod("TOTP")}>
                            <View
                                style={[
                                    styles.preferItemContainer,
                                    method === "TOTP"
                                        ? styles.preferItemContainerActive
                                        : null,
                                ]}
                            >
                                <Image
                                    style={styles.radioButton}
                                    source={
                                        method === "TOTP"
                                            ? require("../../../assets/image/icon/radio_checked.png")
                                            : require("../../../assets/image/icon/radio_uncheck.png")
                                    }
                                    resizeMode={"contain"}
                                />
                                <View>
                                    <Image
                                        style={styles.otpImage}
                                        source={require("../../../assets/image/auth/app-authentication.png")}
                                        resizeMode={"contain"}
                                    />
                                </View>
                                <View>
                                    <Text style={styles.smsMethodTitle}>
                                        {t(
                                            "auth.select_prefer_method.authentication_app"
                                        )}
                                    </Text>
                                    <Text style={styles.smsMethodSub}>
                                        {t(
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
                            onPress={handleSelectPreferMethod}
                            disabled={method == null}
                        />
                    </View>
                    <View style={styles.bottomSpace} />
                </View>
            </>
        );
    })
);

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

export default SelectPreferredMFAScreen;
