import AsyncStorage from "@react-native-async-storage/async-storage";
import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation, useRoute } from "@react-navigation/native";
import { inject, observer } from "mobx-react";
import React, { FC, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
    Alert,
    BackHandler,
    Image,
    ImageBackground,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { useMMKVString } from "react-native-mmkv";
import { Menu, Text } from "react-native-paper";
import {
    AndroidNavigationBar,
    BuildVariant,
} from "../../nativeUtils/NativeModules";
import { AuthenticateStore, LoginStep } from "../../stores/AuthenticateStore";
import { CallbackStore } from "../../stores/CallbackStore";
import { CognitoSessionStore } from "../../stores/CognitoSessionStore";
import { AllStores, RootStore } from "../../stores/RootStore";
import { UserPoolStore } from "../../stores/UserPoolStore";
import { Colors } from "../../utils/Colors";
import {
    ACCOUNT_NAMES,
    ALL_LANGUAGES,
    AppVersion,
    Keys,
    LANGUAGE_MAP,
    WEB_URLS,
} from "../../utils/Constants";
import { Environment } from "../../utils/Environment";

// Import all screens
import { LoginInitialScreen } from "./login/LoginInitialScreen";
import { LoginMFAScreen } from "./login/LoginMFAScreen";
import { LoginSuccessScreen } from "./login/LoginSuccessScreen";
import { LoginTOTPScreen } from "./login/LoginTOTPScreen";
import { LoginTempPasswordScreen } from "./login/LoginTempPasswordScreen";
import SelectPreferredMFAScreen from "./mfa-setup/SelectPreferredMFAScreen";
import { SetupMfaSuccessScreen } from "./mfa-setup/SetupMfaSuccessScreen";
import { SmsSetupScreen } from "./mfa-setup/SmsSetupScreen";
import TotpSetupScreen from "./mfa-setup/TotpSetupScreen";

// Import components
import { useTranslation } from "react-i18next";
import { Select } from "../../shared-components/Select";
import { Spinner } from "../../shared-components/Spinner";
import {
    CathyIconButton,
    CathyTextButton,
} from "../../shared-components/cathy/CathyButton";
import { cathyViews } from "../../shared-components/cathy/CommonViews";
import { SafeAreaFix } from "../../shared-components/cathy/IOSFix";
import { changeLanguage } from "../../utils/I18n";

interface Props {
    navigation: any;
    rootStore: RootStore;
    userPoolStore: UserPoolStore;
    authenticateStore: AuthenticateStore;
    callbackStore: CallbackStore;
    sessionStore: CognitoSessionStore;
}

const LoginScreen: FC<Props> = inject(({ rootStore }: AllStores) => ({
    rootStore,
    userPoolStore: rootStore.userPoolStore,
    authenticateStore: rootStore.authenticateStore,
    callbackStore: rootStore.callbackStore,
    sessionStore: rootStore.cognitoSessionStore,
}))(
    observer(
        ({ rootStore, userPoolStore, authenticateStore, callbackStore }) => {
            const { t, i18n } = useTranslation();
            const [modalVisible, setModalVisible] = useState(false);
            const [accountId, setAccountId] = useState("");
            const [menuVisible, setMenuVisible] = useState(false);
            const [showCompany, setShowCompany] = useState(
                !callbackStore.sessionId
            );
            const [currentLang, setCurrentLang] = useState(i18n.language);
            const loginStepRef = useRef<LoginStep>("Initial");
            const hardwareBackPressSubs = useRef<any>(null);
            const navigation = useNavigation<any>();
            const route = useRoute<any>();
            const loginStep: LoginStep = route.params?.loginStep ?? "Initial";

            const handleExit = (): void => {
                if (!authenticateStore.emptyPassword) {
                    Alert.alert(
                        t("alert.title.exit"),
                        t(
                            authenticateStore.loginStep === "TempPassword"
                                ? "alert.exit_temp_password"
                                : "alert.exit_signin"
                        ),
                        [
                            { text: t("alert.button.cancel"), style: "cancel" },
                            {
                                text: t("alert.button.exit"),
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
            };

            const onBackPressed = (): boolean | undefined => {
                Keyboard.dismiss();
                switch (authenticateStore.loginStep) {
                    case "Initial":
                        return callbackStore.sessionId ? true : false;
                    case "TempPassword":
                    case "MFA":
                        handleExit();
                        return true;
                    case "SelectPreferMethod":
                        handleExit();
                        return true;
                    case "Success":
                        return true;
                }
                return undefined;
            };

            const onPressMenu = (): void => {
                Keyboard.dismiss();
                setMenuVisible(true);
                console.log({ menuVisible: true });
            };

            const onDismissMenu = (): void => {
                setMenuVisible(false);
            };

            const onPressActivate = (): void => {
                onDismissMenu();
                navigation.navigate("Auth/Activate");
            };

            const onPressHelp = (): void => {
                onDismissMenu();
                navigation.navigate("Auth/Web", {
                    title: t("auth.menu.help"),
                    webUrl: WEB_URLS.help,
                });
            };

            const onPressCompany = (): void => {
                onDismissMenu();
                setModalVisible(true);
                if (Platform.OS === "android") {
                    AndroidNavigationBar.setNavigationBarColor("#52000000");
                }
            };

            const onSelectLanguage = (language: string): void => {
                rootStore.useLang(language);
                setCurrentLang(language);
                changeLanguage(language);
                AsyncStorage.setItem(Keys.LANGUAGE, language);
            };

            const onPressSG = (): void => {
                setModalVisible(false);
                setAccountId(Environment.sg.accountId);
                userPoolStore.initUserPool(
                    Environment.sg.userPoolId,
                    Environment.sg.clientId,
                    Environment.sg.accountId
                );
                if (Platform.OS === "android") {
                    AndroidNavigationBar.setNavigationBarColor("#00000000");
                }
            };

            const onPressHK = (): void => {
                setModalVisible(false);
                setAccountId(Environment.hk.accountId);
                userPoolStore.initUserPool(
                    Environment.hk.userPoolId,
                    Environment.hk.clientId,
                    Environment.hk.accountId
                );
                if (Platform.OS === "android") {
                    AndroidNavigationBar.setNavigationBarColor("#00000000");
                }
            };

            const onPressAU = (): void => {
                setModalVisible(false);
                setAccountId(Environment.au.accountId);
                userPoolStore.initUserPool(
                    Environment.au.userPoolId,
                    Environment.au.clientId,
                    Environment.au.accountId
                );
                if (Platform.OS === "android") {
                    AndroidNavigationBar.setNavigationBarColor("#00000000");
                }
            };

            const getBackgroundImage = () => {
                const selectedCountry = callbackStore.sessionId
                    ? callbackStore.appName
                    : ACCOUNT_NAMES[userPoolStore.accountId];
                switch (selectedCountry) {
                    case "Certis SG":
                        return require("../../assets/image/background/SG_background.jpg");
                    case "Certis HK":
                        return require("../../assets/image/background/Hongkong_background.png");
                    case "Certis AU":
                        return require("../../assets/image/background/Australia_background.png");
                    default:
                        return require("../../assets/image/background/SG_background.jpg");
                }
            };

            // Update navigation params when login step changes
            if (authenticateStore.loginStep !== loginStepRef.current) {
                loginStepRef.current = authenticateStore.loginStep;
                setTimeout(() => {
                    setMenuVisible(false);
                });
            }

            let loginChildScreen;
            switch (authenticateStore.loginStep) {
                case "Initial":
                    loginChildScreen = (
                        <LoginInitialScreen
                            navigation={navigation}
                            accountId={accountId}
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
                        <SelectPreferredMFAScreen navigation={navigation} />
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
                        <SetupMfaSuccessScreen navigation={navigation} />
                    );
                    break;
                case "Success":
                    loginChildScreen = (
                        <LoginSuccessScreen navigation={navigation} />
                    );
                    break;
            }

            // ComponentDidMount
            useEffect(() => {
                authenticateStore.clearStates();

                setShowCompany(!callbackStore.sessionId);

                const willFocusSubs = navigation.addListener("focus", () => {
                    hardwareBackPressSubs.current =
                        BackHandler.addEventListener(
                            "hardwareBackPress",
                            onBackPressed
                        );
                });

                const willBlurSubs = navigation.addListener("blur", () => {
                    if (hardwareBackPressSubs.current) {
                        hardwareBackPressSubs.current.remove();
                    }
                });

                return () => {
                    willFocusSubs?.remove?.();
                    willBlurSubs?.remove?.();
                    if (hardwareBackPressSubs.current) {
                        hardwareBackPressSubs.current.remove();
                    }
                };
            }, []);

            //
            useLayoutEffect(() => {
                navigation.setOptions({
                    title: "",
                    headerLeft:
                        loginStep === "TempPassword" ||
                        loginStep === "MFA" ||
                        loginStep === "SelectPreferMethod" ? (
                            <HeaderBackButton
                                tintColor={
                                    Platform.OS === "android"
                                        ? Colors.unfocusedIcon
                                        : Colors.focusedIcon
                                }
                                onPress={onBackPressed}
                            />
                        ) : undefined,
                    headerRight:
                        loginStep === "Initial"
                            ? () => (
                                  <View style={{ flexDirection: "row" }}>
                                      <View style={styles.languageButton}>
                                          <Image
                                              style={styles.languageIcon}
                                              source={require("../../assets/image/icon/language.png")}
                                          />
                                          <Select
                                              style={StyleSheet.absoluteFill}
                                              triggerTextStyle={
                                                  styles.languageTriggerText
                                              }
                                              selectedValue={currentLang}
                                              onValueChange={onSelectLanguage}
                                          >
                                              {ALL_LANGUAGES.map(
                                                  (lang, index) => (
                                                      <Select.Item
                                                          key={index}
                                                          label={
                                                              LANGUAGE_MAP[lang]
                                                          }
                                                          value={lang}
                                                          selectedColor={
                                                              Colors.cathyBlue
                                                          }
                                                      />
                                                  )
                                              )}
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
                                              onPress={onPressMenu}
                                          />
                                          <Menu
                                              visible={menuVisible}
                                              onDismiss={onDismissMenu}
                                              anchor={
                                                  <View
                                                      style={styles.menuAnchor}
                                                  />
                                              }
                                          >
                                              <Menu.Item
                                                  leadingIcon={require("../../assets/image/icon/verified_user.png")}
                                                  title={t(
                                                      "auth.menu.activate"
                                                  )}
                                                  onPress={onPressActivate}
                                              />
                                              <Menu.Item
                                                  leadingIcon={require("../../assets/image/icon/help.png")}
                                                  title={t("auth.menu.help")}
                                                  onPress={onPressHelp}
                                              />
                                              {showCompany && (
                                                  <Menu.Item
                                                      leadingIcon={require("../../assets/image/icon/corporate_fare.png")}
                                                      title={t(
                                                          "auth.menu.company"
                                                      )}
                                                      onPress={onPressCompany}
                                                  />
                                              )}
                                          </Menu>
                                      </View>
                                  </View>
                              )
                            : undefined,
                });
            }, [menuVisible, currentLang, showCompany]);

            return (
                <ImageBackground
                    source={getBackgroundImage()}
                    style={styles.background}
                >
                    <SafeAreaFix
                        statusBarColor={"transparent"}
                        containerColor={"transparent"}
                    >
                        <View style={styles.container}>
                            <TouchableOpacity
                                onPress={() => {
                                    onSelectLanguage("en");
                                }}
                            >
                                <Text>Language EN</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    onSelectLanguage("zh");
                                }}
                            >
                                <Text>Language HANT</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    onSelectLanguage("zh-Hans");
                                }}
                            >
                                <Text>Language HANZ</Text>
                            </TouchableOpacity>

                            <TouchableWithoutFeedback
                                onPress={() => Keyboard.dismiss()}
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
                                            (BuildVariant.buildType ===
                                            "release"
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
                                    <View style={styles.modalContainer}>
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
                    </SafeAreaFix>
                </ImageBackground>
            );
        }
    )
);

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

export { LoginScreen };
