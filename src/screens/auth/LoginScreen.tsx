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
import React, { Fragment, Component } from "react";
import {
    View,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Image,
    Keyboard,
    Alert,
    BackHandler,
    Platform,
    StyleSheet,
    ImageBackground,
    Modal,
    StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { inject, observer } from "mobx-react";
import {
    NavigationScreenProp,
    NavigationRoute,
    NavigationEventSubscription,
    NavigationEventPayload,
    NavigationScreenConfig,
} from "react-navigation";
import { HeaderBackButton } from "react-navigation-stack";

import { Menu, Text } from "react-native-paper";
import { I18n } from "../../utils/I18n";
import { Colors } from "../../utils/Colors";
import {
    ALL_LANGUAGES,
    LANGUAGE_MAP,
    Keys,
    WEB_URLS,
    ACCOUNT_NAMES,
} from "../../utils/Constants";
import { RootStore, AllStores } from "../../stores/RootStore";
import { UserPoolStore } from "../../stores/UserPoolStore";
import { AuthenticateStore, LoginStep } from "../../stores/AuthenticateStore";
import { CallbackStore } from "../../stores/CallbackStore";
import { LoginInitialScreen } from "./login/LoginInitialScreen";
import { LoginTempPasswordScreen } from "./login/LoginTempPasswordScreen";
import { LoginMFAScreen } from "./login/LoginMFAScreen";
import { LoginSuccessScreen } from "./login/LoginSuccessScreen";
import { Select } from "../../shared-components/Select";
import { Spinner } from "../../shared-components/Spinner";
import { SafeAreaFix } from "../../shared-components/cathy/IOSFix";
import {
    CathyIconButton,
    CathyTextButton,
} from "../../shared-components/cathy/CathyButton";
import { cathyViews } from "../../shared-components/cathy/CommonViews";
import { LoginTOTPScreen } from "./login/LoginTOTPScreen";
import SelectPreferredMFAScreen from "./mfa-setup/SelectPreferredMFAScreen";
import TotpSetupScreen from "./mfa-setup/TotpSetupScreen";
import { AndroidNavigationBar } from "../../nativeUtils/NativeModules";
import { Environment } from "../../utils/Environment";
import { SmsSetupScreen } from "./mfa-setup/SmsSetupScreen";
import { SetupMfaSuccessScreen } from "./mfa-setup/SetupMfaSuccessScreen";
import { CognitoSessionStore } from "../../stores/CognitoSessionStore";
import { AppVersion } from "../../utils/Constants";
import { BuildVariant } from "../../nativeUtils/NativeModules";

interface Props {
    navigation: NavigationScreenProp<NavigationRoute>;
    rootStore: RootStore;
    userPoolStore: UserPoolStore;
    authenticateStore: AuthenticateStore;
    callbackStore: CallbackStore;
    sessionStore: CognitoSessionStore;
}
interface State {
    modalVisible: boolean;
    accountId: string;
}
/**
 * Login component, contains 4 steps, each step one child component
 *
 * @author Lingqi
 */
@inject(({ rootStore }: AllStores) => ({
    rootStore,
    userPoolStore: rootStore.userPoolStore,
    authenticateStore: rootStore.authenticateStore,
    callbackStore: rootStore.callbackStore,
    sessionStore: rootStore.cognitoSessionStore,
}))
@observer
export class LoginScreen extends Component<Props, State> {
    private willFocusSubs!: NavigationEventSubscription;
    private willBlurSubs!: NavigationEventSubscription;
    private hardwareBackPressSubs!: NavigationEventSubscription;

    private loginStep: LoginStep;

    constructor(props: Props) {
        super(props);
        props.authenticateStore.clearStates();
        this.loginStep = "Initial";
        this.state = {
            modalVisible: false,
            accountId: "",
        };
        this.onWillFocus = this.onWillFocus.bind(this);
        this.onWillBlur = this.onWillBlur.bind(this);
        this.onBackPressed = this.onBackPressed.bind(this);
        this.onPressMenu = this.onPressMenu.bind(this);
        this.onDismissMenu = this.onDismissMenu.bind(this);
        this.onPressActivate = this.onPressActivate.bind(this);
        this.onPressCompany = this.onPressCompany.bind(this);
        this.onPressHelp = this.onPressHelp.bind(this);
        this.onPressBackground = this.onPressBackground.bind(this);
        this.onSelectLanguage = this.onSelectLanguage.bind(this);
        this.getBackgroundImage = this.getBackgroundImage.bind(this);
        this.onPressSG = this.onPressSG.bind(this);
        this.onPressHK = this.onPressHK.bind(this);
        this.onPressAU = this.onPressAU.bind(this);
    }

    //**************************************************************
    // Screen Header
    //****************************************************************

    static navigationOptions: NavigationScreenConfig<any, any> = ({
        navigation,
        screenProps,
    }) => {
        const loginStep: LoginStep = navigation.getParam(
            "loginStep",
            "Initial"
        );
        return {
            title: "",
            headerLeft:
                loginStep === "TempPassword" ||
                loginStep === "MFA" ||
                loginStep === "SelectPreferMethod" ? (
                    <HeaderBackButton
                        backTitleVisible={Platform.OS === "ios"}
                        tintColor={
                            Platform.OS === "android"
                                ? Colors.unfocusedIcon
                                : Colors.focusedIcon
                        }
                        pressColorAndroid={Colors.blackOverlay}
                        onPress={navigation.getParam("onBackPressed")}
                    />
                ) : undefined,
            headerRight:
                loginStep === "Initial" ? (
                    <Fragment>
                        <View style={styles.languageButton}>
                            <Image
                                style={styles.languageIcon}
                                source={require("../../assets/image/icon/language.png")}
                            />
                            <Select
                                style={StyleSheet.absoluteFill}
                                triggerTextStyle={styles.languageTriggerText}
                                triggerArrowColor={"transparent"}
                                selectedValue={screenProps.currentLang}
                                onValueChange={navigation.getParam(
                                    "onSelectLanguage"
                                )}
                            >
                                {ALL_LANGUAGES.map((lang, index) => (
                                    <Select.Item
                                        key={index}
                                        label={LANGUAGE_MAP[lang]}
                                        value={lang}
                                        selectedColor={Colors.cathyBlue}
                                    />
                                ))}
                            </Select>
                        </View>
                        <View style={styles.menuContainer}>
                            <CathyIconButton
                                style={StyleSheet.absoluteFill}
                                iconSource={require("../../assets/image/icon/more.png")}
                                tintColor={
                                    Platform.OS === "android"
                                        ? Colors.unfocusedIcon
                                        : Colors.focusedIcon
                                }
                                onPress={navigation.getParam("onPressMenu")}
                            />
                            <Menu
                                visible={navigation.getParam("menuVisible")}
                                onDismiss={navigation.getParam("onDismissMenu")}
                                anchor={<View style={styles.menuAnchor} />}
                            >
                                <Menu.Item
                                    leadingIcon={require("../../assets/image/icon/verified_user.png")}
                                    title={I18n.t("auth.menu.activate")}
                                    onPress={navigation.getParam(
                                        "onPressActivate"
                                    )}
                                />
                                <Menu.Item
                                    leadingIcon={require("../../assets/image/icon/help.png")}
                                    title={I18n.t("auth.menu.help")}
                                    onPress={navigation.getParam("onPressHelp")}
                                />
                                {navigation.getParam("showCompany", false) && (
                                    <Menu.Item
                                        leadingIcon={require("../../assets/image/icon/corporate_fare.png")}
                                        title={I18n.t("auth.menu.company")}
                                        onPress={navigation.getParam(
                                            "onPressCompany"
                                        )}
                                    />
                                )}
                            </Menu>
                        </View>
                    </Fragment>
                ) : undefined,
        };
    };

    //**************************************************************
    // Component Lifecycle
    //****************************************************************

    componentDidMount() {
        const { navigation, callbackStore } = this.props;
        navigation.setParams({
            onBackPressed: this.onBackPressed,
            onPressMenu: this.onPressMenu,
            onDismissMenu: this.onDismissMenu,
            onPressActivate: this.onPressActivate,
            onPressCompany: this.onPressCompany,
            onPressHelp: this.onPressHelp,
            onSelectLanguage: this.onSelectLanguage,
            showCompany: !callbackStore.sessionId,
        });
        this.willFocusSubs = navigation.addListener(
            "willFocus",
            this.onWillFocus
        );
        this.willBlurSubs = navigation.addListener("willBlur", this.onWillBlur);
        this.willBlurSubs = navigation.addListener("willBlur", this.onWillBlur);
    }

    componentWillUnmount() {
        this.willFocusSubs.remove();
        this.willBlurSubs.remove();
        this.hardwareBackPressSubs.remove();
    }
    //**************************************************************
    // Navigation Lifecycle
    //****************************************************************

    onWillFocus(payload: NavigationEventPayload) {
        this.hardwareBackPressSubs = BackHandler.addEventListener(
            "hardwareBackPress",
            this.onBackPressed
        );
    }

    onWillBlur(payload: NavigationEventPayload) {
        this.hardwareBackPressSubs.remove();
    }

    //**************************************************************
    // Button Callbacks
    //****************************************************************

    private onBackPressed(): boolean | undefined {
        Keyboard.dismiss();
        switch (this.props.authenticateStore.loginStep) {
            case "Initial":
                return this.props.callbackStore.sessionId ? true : false;
            case "TempPassword":
            case "MFA":
                this.handleExit();
                return true;
            case "SelectPreferMethod":
                this.handleExit();
                return true;
            case "Success":
                return true;
        }
        return undefined;
    }

    private onPressMenu(): void {
        Keyboard.dismiss();
        this.props.navigation.setParams({ menuVisible: true });
    }

    private onDismissMenu(): void {
        this.props.navigation.setParams({ menuVisible: false });
    }

    private onPressActivate(): void {
        this.onDismissMenu();
        this.props.navigation.navigate("Auth/Activate");
    }

    private onPressHelp(): void {
        this.onDismissMenu();
        this.props.navigation.navigate("Auth/Web", {
            title: I18n.t("auth.menu.help"),
            webUrl: WEB_URLS.help,
        });
    }

    private onPressCompany(): void {
        this.onDismissMenu();
        // this.props.userPoolStore.clearCachedUserPool();
        // this.props.navigation.navigate('Splash');
        this.modalVisible = true;
    }

    private onPressBackground(): void {
        Keyboard.dismiss();
    }

    //**************************************************************
    // Other Methods
    //****************************************************************

    private onSelectLanguage(language: string): void {
        this.props.rootStore.useLang(language);
        this.props.navigation.setParams({ currentLang: language });
        AsyncStorage.setItem(Keys.LANGUAGE, language);
    }

    private handleExit(): void {
        const { authenticateStore } = this.props;
        if (!authenticateStore.emptyPassword) {
            Alert.alert(
                I18n.t("alert.title.exit"),
                I18n.t(
                    authenticateStore.loginStep === "TempPassword"
                        ? "alert.exit_temp_password"
                        : "alert.exit_signin"
                ),
                [
                    { text: I18n.t("alert.button.cancel"), style: "cancel" },
                    {
                        text: I18n.t("alert.button.exit"),
                        onPress: () => {
                            authenticateStore.clearStates();
                        },
                        style: "destructive",
                    },
                ],
                { cancelable: false }
            );
        } else {
            authenticateStore.clearStates();
        }
    }
    private getBackgroundImage() {
        const { userPoolStore, callbackStore } = this.props;

        let selectedCountry = callbackStore.sessionId
            ? callbackStore.appName
            : ACCOUNT_NAMES[userPoolStore.accountId];
        switch (selectedCountry) {
            case "Certis SG":
                return require("../../assets/image/background/SG_background.jpg");
            case "Certis HK":
                return require("../../assets/image/background/Hongkong_background.png");
            case "Certis AU":
                return require("../../assets/image/background/Australia_background.png");
            // Add more cases for other countries
            default:
                return require("../../assets/image/background/SG_background.jpg");
        }
    }
    private set modalVisible(modalVisible: boolean) {
        this.setState({ modalVisible });
        if (Platform.OS === "android") {
            const color = modalVisible ? "#52000000" : "#00000000";
            AndroidNavigationBar.setNavigationBarColor(color);
        }
    }
    private get modalVisible(): boolean {
        return this.state.modalVisible;
    }
    private onPressSG(): void {
        this.modalVisible = false;
        this.setState({ accountId: Environment.sg.accountId });
        this.props.userPoolStore.initUserPool(
            Environment.sg.userPoolId,
            Environment.sg.clientId,
            Environment.sg.accountId
        );
    }

    private onPressHK(): void {
        this.modalVisible = false;
        this.setState({ accountId: Environment.hk.accountId });
        this.props.userPoolStore.initUserPool(
            Environment.hk.userPoolId,
            Environment.hk.clientId,
            Environment.hk.accountId
        );
    }

    private onPressAU(): void {
        this.modalVisible = false;
        this.setState({ accountId: Environment.au.accountId });
        this.props.userPoolStore.initUserPool(
            Environment.au.userPoolId,
            Environment.au.clientId,
            Environment.au.accountId
        );
    }
    //**************************************************************
    // Render
    //****************************************************************

    render() {
        const { authenticateStore } = this.props;
        // prevent infinite re-rendering
        if (authenticateStore.loginStep !== this.loginStep) {
            this.loginStep = authenticateStore.loginStep;
            setTimeout(() => {
                this.props.navigation.setParams({
                    loginStep: authenticateStore.loginStep,
                });
            });
        }
        let loginChildScreen;
        switch (authenticateStore.loginStep) {
            case "Initial":
                loginChildScreen = (
                    <LoginInitialScreen
                        navigation={this.props.navigation}
                        accountId={this.state.accountId}
                    />
                );
                break;
            case "TempPassword":
                loginChildScreen = <LoginTempPasswordScreen />;
                break;
            case "MFA":
                loginChildScreen = <LoginMFAScreen />;
                break;
            case "TOTP":
                loginChildScreen = <LoginTOTPScreen />;
                break;
            case "SelectPreferMethod":
                loginChildScreen = (
                    <SelectPreferredMFAScreen
                        navigation={this.props.navigation}
                    />
                );
                break;
            case "TotpSetup":
                loginChildScreen = <TotpSetupScreen />;
                break;
            case "SmsSetup":
                loginChildScreen = <SmsSetupScreen />;
                break;
            case "MfaSetupSuccess":
                loginChildScreen = (
                    <SetupMfaSuccessScreen navigation={this.props.navigation} />
                );
                break;
            case "Success":
                loginChildScreen = (
                    <LoginSuccessScreen navigation={this.props.navigation} />
                );
                break;
        }
        return (
            <ImageBackground
                source={this.getBackgroundImage()}
                style={styles.background}
            >
                <SafeAreaFix
                    statusBarColor={"transparent"}
                    containerColor={"transparent"}
                >
                    <View style={styles.container}>
                        <TouchableWithoutFeedback
                            onPress={this.onPressBackground}
                        >
                            <KeyboardAvoidingView
                                style={styles.keyboardAvoidingContainer}
                                behavior={"padding"}
                                keyboardVerticalOffset={
                                    Platform.OS === "android" ? 24 : 0
                                }
                            >
                                <Spinner
                                    isVisible={authenticateStore.isFetching}
                                />
                                {loginChildScreen}
                                <Text style={styles.versionText}>
                                    {AppVersion.version +
                                        (BuildVariant.buildType === "release"
                                            ? ""
                                            : ` (${BuildVariant.buildType})`)}
                                </Text>
                                <Image
                                    style={cathyViews.bottomLogo}
                                    source={require("../../assets/image/logo_login.png")}
                                />
                            </KeyboardAvoidingView>
                        </TouchableWithoutFeedback>
                        <Modal
                            animationType={"fade"}
                            transparent={true}
                            visible={this.modalVisible}
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
                                <View style={styles.modalContainer}>
                                    <View style={styles.selectorContainer}>
                                        <CathyTextButton
                                            style={styles.sgButton}
                                            text={"Certis SG"}
                                            onPress={this.onPressSG}
                                        />
                                        <CathyTextButton
                                            style={styles.hkButton}
                                            text={"Certis HK"}
                                            onPress={this.onPressHK}
                                        />
                                        <CathyTextButton
                                            style={styles.auButton}
                                            text={"Certis AU"}
                                            onPress={this.onPressAU}
                                        />
                                    </View>
                                </View>
                            </SafeAreaFix>
                        </Modal>
                    </View>
                </SafeAreaFix>
            </ImageBackground>
        );
    }
}

const styles = StyleSheet.create({
    languageButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    languageIcon: {
        width: 24,
        height: 24,
        tintColor: Platform.select({
            android: Colors.unfocusedIcon,
            ios: Colors.focusedIcon,
        }),
    },
    languageTriggerText: {
        color: "transparent",
    },
    menuContainer: {
        width: 40,
        height: 40,
        marginRight: 8,
        justifyContent: "flex-end",
    },
    menuAnchor: {
        height: 1,
        backgroundColor: "transparent",
    },
    keyboardAvoidingContainer: {
        flex: 1,
        justifyContent: "flex-end",
        overflow: "hidden",
    },
    background: {
        flex: 1,
        resizeMode: "cover", // or 'stretch' for different image resizing options
        justifyContent: "flex-start", // or 'flex-start', 'flex-end' for vertical positioning
    },
    container: {
        flex: 1,
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
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    versionText: {
        textAlign: "center",
        marginBottom: 20,
        fontSize: 14,
        fontFamily: "Roboto-Regular",
        letterSpacing: 0.5,
        lineHeight: 18,
        color: "#FFFFFF",
        position: "absolute",
        alignSelf: "center",
        width: "100%",
        height: "auto",
        bottom: 60,
        zIndex: 3,
    },
});
