import { useNavigation } from "@react-navigation/native";
import { inject, observer } from "mobx-react";
import React, { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { CathyRaisedButton } from "../../../shared-components/cathy/CathyButton";
import { Select } from "../../../shared-components/Select";
import { Spinner } from "../../../shared-components/Spinner";
import { AuthenticateStore } from "../../../stores/AuthenticateStore";
import { CognitoSessionStore } from "../../../stores/CognitoSessionStore";
import { AllStores, RootStore } from "../../../stores/RootStore";
import { Colors } from "../../../utils/Colors";
import NoneMfaConfirmModal from "./modal/NoneMfaConfirmModal";

enum PreferMethod {
    TOTP = "SOFTWARE_TOKEN_MFA",
    SMS = "SMS_MFA",
    None = "None",
}
type MfaTypeSelection = "SOFTWARE_TOKEN_MFA" | "SMS" | "";

type MfaTypeList = {
    label: "auth.mfa.totp" | "auth.mfa.sms";
    value: MfaTypeSelection;
};
interface Props {
    navigation: any;
    rootStore: RootStore;
    authenticationStore: AuthenticateStore;
    sessionStore: CognitoSessionStore;
}

const ProfileMfaSettingsScreen: FC<Props> = inject(
    ({ rootStore }: AllStores) => ({
        rootStore,
        authenticationStore: rootStore.authenticateStore,
        sessionStore: rootStore.cognitoSessionStore,
    })
)(
    observer(({ authenticationStore }) => {
        const { t } = useTranslation();
        const navigation = useNavigation<any>();
        const [modalVisible, setModalVisible] = useState(false);
        const [currentMFA, setCurrentMFA] = useState("");

        useEffect(() => {
            navigation.setOptions({
                title: t("profile.item.mfa_setting"),
            });
        }, []);

        useEffect(() => {
            authenticationStore.getUserData().then(() => {
                setCurrentMFA(authenticationStore.preferredMfaSetting);
            });
            authenticationStore.getUserPoolMFAOptions();
        }, []);

        const onChange = (method: PreferMethod): void => {
            authenticationStore.setPreferredMfaSetting(method);
        };

        const handleSelectTOTP = () => {
            authenticationStore.associateSoftwareToken();
            navigation.navigate("Auth/Login");
        };

        const handleSelectSMS = () => {
            const smsMfaSettings = {
                PreferredMfa: true,
                Enabled: true,
            };
            authenticationStore.setUserMfaPreference(smsMfaSettings, null);
        };

        const onClearAll = () => {
            setCurrentMFA("");
            setModalVisible(false);
            const totpMfaSettings = {
                PreferredMfa: false,
                Enabled: false,
            };
            const smsMfaSettings = {
                PreferredMfa: false,
                Enabled: false,
            };
            authenticationStore.setUserMfaPreference(
                smsMfaSettings,
                totpMfaSettings
            );
        };

        const onSubmit = (): void => {
            if (authenticationStore.preferredMfaSetting === PreferMethod.None) {
                setModalVisible(true);
            } else if (
                authenticationStore.preferredMfaSetting === PreferMethod.TOTP
            ) {
                handleSelectTOTP();
            } else if (
                authenticationStore.preferredMfaSetting === PreferMethod.SMS
            ) {
                handleSelectSMS();
            }
        };

        const { preferredMfaSetting, isFetching, userPoolMFAOption } =
            authenticationStore;

        // Determine which MFA options are available based on userPoolMFAOption
        const mfaOptionList: MfaTypeList[] = [];
        if (userPoolMFAOption.methods.includes("SOFTWARE_TOKEN")) {
            mfaOptionList.push({
                label: "auth.mfa.totp",
                value: "SOFTWARE_TOKEN_MFA",
            });
        }
        if (userPoolMFAOption.methods.includes("SMS")) {
            mfaOptionList.push({
                label: "auth.mfa.sms",
                value: "SMS",
            });
        }

        return (
            <View style={styles.container}>
                <View>
                    <Spinner isVisible={isFetching} />
                    <Text style={styles.languageLabel}>
                        {t("auth.mfa.settings_label")}
                    </Text>
                    <Select
                        style={styles.languageSelect}
                        triggerTextStyle={styles.languageTriggerText}
                        selectedValue={preferredMfaSetting}
                        onValueChange={(value) =>
                            onChange(value as PreferMethod)
                        }
                    >
                        {mfaOptionList.map((option, index) => (
                            <Select.Item
                                key={index}
                                label={t(option.label)}
                                value={option.value}
                            />
                        ))}
                        <Select.Item label="None" value={PreferMethod.None} />
                    </Select>
                </View>

                <View style={styles.submitContainer}>
                    <CathyRaisedButton
                        style={styles.loginButton}
                        text="Submit"
                        onPress={onSubmit}
                        disabled={preferredMfaSetting === currentMFA}
                    />
                </View>

                <NoneMfaConfirmModal
                    setModalVisible={setModalVisible}
                    onClearAll={onClearAll}
                    modalVisible={modalVisible}
                />
            </View>
        );
    })
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "whitesmoke",
    },
    languageLabel: {
        marginTop: 24,
        marginLeft: 36,
        fontSize: 12,
        fontFamily: "Arial",
        letterSpacing: 1,
        lineHeight: 16,
        color: "black",
    },
    languageSelect: {
        marginTop: 4,
        height: 48,
        marginHorizontal: 24,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: Colors.cathyBlueBorder,
        backgroundColor: "white",
    },
    languageTriggerText: {
        color: Colors.cathyMajorText,
    },
    loginButton: {
        marginHorizontal: 0,
    },
    submitContainer: {
        margin: 20,
    },
    raisedButton: {
        height: 48,
        marginHorizontal: 24,
        zIndex: 1,
        backgroundColor: "#FF9933",
        borderRadius: 4,
    },
    modalBackground: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        backgroundColor: "white",
        padding: 20,
        width: "90%",
        height: "50%",
    },
    modalImageContainer: {
        marginBottom: "5%",
        alignItems: "center",
    },
    modalImage: {
        width: 100,
        height: 100,
        margin: 10,
    },
    modalText: {
        textAlign: "center",
        fontSize: 20,
    },
    modalSubText: {
        textAlign: "center",
        marginBottom: "10%",
    },
    modalButtonContainer: {
        flex: 1,
    },
    cancelButton: {
        margin: 10,
    },
});

export { ProfileMfaSettingsScreen };
