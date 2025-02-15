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
import { faFingerprint } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { inject, observer } from "mobx-react";
import React, { FC, Fragment } from "react";
import { useTranslation } from "react-i18next";
import {
    Alert,
    Image,
    ImageSourcePropType,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";
import { MaterialButton } from "../../../shared-components/MaterialButton";
import { SafeAreaFix } from "../../../shared-components/cathy/IOSFix";
import { BiometricStore } from "../../../stores/BiometricStore";
import { CognitoSessionStore } from "../../../stores/CognitoSessionStore";
import { AllStores } from "../../../stores/RootStore";
import { Colors } from "../../../utils/Colors";
import { WEB_URLS } from "../../../utils/Constants";

interface Props {
    navigation: any;
    sessionStore: CognitoSessionStore;
    biometricStore: BiometricStore;
}

const ProfileScreen: FC<Props> = inject(({ rootStore }: AllStores) => ({
    sessionStore: rootStore.cognitoSessionStore,
    biometricStore: rootStore.biometricStore,
}))(
    observer(({ navigation, sessionStore, biometricStore }) => {
        const { t } = useTranslation();

        const onPressPassword = (): void => {
            navigation.navigate("Main/Profile/Password");
        };

        const onPressSettings = (): void => {
            navigation.navigate("Main/Profile/Settings");
        };

        const onPressMfaSettings = (): void => {
            navigation.navigate("Main/Profile/MFA");
        };

        const onPressHelp = (): void => {
            navigation.navigate("Main/Profile/Web", {
                title: t("auth.menu.help"),
                webUrl: WEB_URLS.help,
            });
        };

        const onPressAbout = (): void => {
            navigation.navigate("Main/Profile/About");
        };

        const onPressLogout = (): void => {
            sessionStore.signOut();
            navigation.navigate("Auth/Login", { isSignOut: true });
        };

        const showAlert = (title: string, message: string): void => {
            setTimeout(() => {
                Alert.alert(
                    title,
                    message,
                    [{ text: t("alert.button.ok"), style: "cancel" }],
                    { cancelable: false }
                );
            }, 100);
        };

        const onValueChangedBiometric = (value: boolean): void => {
            biometricStore.configBiometrics(value);
            if (biometricStore.isBioSystemReady && value) {
                const bioType = t(
                    `auth.biometrics.${biometricStore.bioLocalisationKey}`
                );
                showAlert(
                    t("auth.biometrics.enable_successful_title", {
                        bioType: bioType,
                    }),
                    t("auth.biometrics.enable_successful_subtitle", {
                        bioType: bioType,
                    })
                );
            } else if (!biometricStore.isBioSystemReady && value) {
                const bioType = t(
                    `auth.biometrics.${biometricStore.savedBioType}`
                );
                showAlert(
                    t("auth.biometrics.cannot_enable_title", {
                        bioType: bioType,
                    }),
                    t("auth.biometrics.cannot_enable_subtitle", {
                        bioType: bioType,
                    })
                );
            }
        };

        const bioType = biometricStore.bioLocalisationKey;
        const savedBioType = biometricStore.savedBioType;
        let bioTypeWithLocale = "None";
        if (bioType != "None") {
            bioTypeWithLocale = t(`auth.biometrics.${bioType}`);
        } else if (savedBioType != "None") {
            bioTypeWithLocale = t(`auth.biometrics.${savedBioType}`);
        }

        return (
            <SafeAreaFix
                statusBarColor={Colors.cathyBlue}
                containerColor={"white"}
            >
                <ScrollView style={styles.container} bounces={false}>
                    <View style={styles.profileHeader}>
                        <Image
                            style={styles.profileHeaderAvatar}
                            source={require("../../../assets/image/placeholder-avatar.png")}
                            resizeMode={"cover"}
                        />
                        <Text style={styles.profileHeaderName}>
                            {sessionStore?.currentCognitoUser?.getUsername() ||
                                ""}
                        </Text>
                    </View>
                    <ProfileItem
                        icon={require("../../../assets/image/icon/info.png")}
                        title={t("profile.item.about")}
                        onPress={onPressAbout}
                    />
                    <ProfileItem
                        icon={require("../../../assets/image/icon/key.png")}
                        title={t("profile.item.password")}
                        onPress={onPressPassword}
                    />
                    <ProfileItem
                        icon={require("../../../assets/image/icon/mfa_settings.png")}
                        title={t("profile.item.mfa_setting")}
                        onPress={onPressMfaSettings}
                    />
                    <ProfileItem
                        icon={require("../../../assets/image/icon/settings.png")}
                        title={t("profile.item.settings")}
                        onPress={onPressSettings}
                    />
                    <ProfileItem
                        icon={require("../../../assets/image/icon/help.png")}
                        title={t("auth.menu.help")}
                        onPress={onPressHelp}
                    />
                    {bioTypeWithLocale != "None" && (
                        <Fragment>
                            <View style={styles.profileDivider} />
                            <View style={styles.bioSwitchContainer}>
                                <FontAwesomeIcon
                                    icon={faFingerprint}
                                    size={18}
                                    style={styles.bioSwitchIcon}
                                ></FontAwesomeIcon>
                                <Text style={styles.bioSwitchLabel}>
                                    {bioTypeWithLocale}
                                </Text>
                                <Switch
                                    style={styles.bioSwitch}
                                    value={
                                        biometricStore.isBioEnabledByUser &&
                                        biometricStore.isBioReady &&
                                        !biometricStore.isLockedOut
                                    }
                                    onValueChange={onValueChangedBiometric}
                                />
                            </View>
                        </Fragment>
                    )}
                    <View style={styles.profileDivider} />
                    <MaterialButton
                        style={styles.profileItem}
                        contentStyle={styles.profileItemContent}
                        rippleColor={Colors.blackOverlay}
                        onPress={onPressLogout}
                    >
                        <Image
                            style={styles.profileItemIcon}
                            source={require("../../../assets/image/icon/power.png")}
                            resizeMode={"cover"}
                        />
                        <Text
                            style={[styles.profileItemText, styles.logoutText]}
                        >
                            {t("profile.item.logout")}
                        </Text>
                    </MaterialButton>
                </ScrollView>
            </SafeAreaFix>
        );
    })
);

// Convert ProfileItem to functional component
const ProfileItem: FC<ItemProps> = ({ icon, title, onPress }) => (
    <MaterialButton
        style={styles.profileItem}
        contentStyle={styles.profileItemContent}
        rippleColor={Colors.blackOverlay}
        onPress={onPress}
    >
        <Image
            style={styles.profileItemIcon}
            source={icon}
            resizeMode={"cover"}
        />
        <Text style={styles.profileItemText}>{title}</Text>
    </MaterialButton>
);

interface ItemProps {
    icon: ImageSourcePropType;
    title: string;
    onPress: () => void;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "whitesmoke",
    },
    profileHeader: {
        height: 180,
        marginBottom: 8,
        backgroundColor: Colors.cathyBlue,
        alignItems: "center",
        justifyContent: "center",
        ...Platform.select({
            android: {
                elevation: 4,
                borderBottomWidth:
                    typeof Platform.Version === "number" &&
                    Platform.Version < 21
                        ? 1
                        : undefined,
                borderBottomColor:
                    typeof Platform.Version === "number" &&
                    Platform.Version < 21
                        ? Colors.darkDivider
                        : undefined,
            },
            ios: {
                shadowColor: "black",
                shadowOpacity: 0.24,
                shadowRadius: 4,
                shadowOffset: {
                    width: 0,
                    height: 3,
                },
            },
        }),
    },
    profileHeaderAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    profileHeaderName: {
        marginTop: 8,
        fontSize: 14,
        fontFamily: "Roboto-Medium",
        letterSpacing: 0.5,
        lineHeight: 16,
        color: "white",
    },
    profileItem: {
        height: 56,
    },
    profileItemContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    profileItemIcon: {
        marginLeft: 16,
        width: 24,
        height: 24,
        tintColor: Colors.unfocusedIcon,
    },
    profileItemText: {
        marginLeft: 32,
        fontSize: 16,
        fontFamily: "Roboto-Regular",
        letterSpacing: 0.5,
        color: Colors.majorText,
    },
    profileDivider: {
        height: 1,
        marginVertical: 8,
        marginHorizontal: 16,
        backgroundColor: Colors.darkDivider,
    },
    logoutText: {
        color: Colors.matRed,
    },
    bioSwitchContainer: {
        flexDirection: "row",
        alignItems: "center",
        height: 56,
    },
    bioSwitchLabel: {
        flexGrow: 1,
        marginLeft: 34,
        fontSize: 16,
        fontFamily: "Roboto-Regular",
        letterSpacing: 0.5,
        color: Colors.majorText,
    },
    bioSwitch: {
        marginLeft: 32,
        marginRight: 24,
    },
    bioSwitchIcon: {
        marginLeft: 19,
        color: Colors.unfocusedIcon,
    },
});

export { ProfileScreen };
