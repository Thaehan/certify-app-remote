import React, { Component, PureComponent } from "react";
import {
    Text,
    View,
    StyleSheet,
    Alert,
    Modal,
    Image,
    Button,
} from "react-native";
import { inject, observer } from "mobx-react";
import {
    NavigationScreenProp,
    NavigationRoute,
    NavigationScreenConfig,
    NavigationStackScreenOptions,
} from "react-navigation";
import { I18n } from "../../../utils/I18n";
import { Colors } from "../../../utils/Colors";
import { Select } from "../../../shared-components/Select";
import { RootStore, AllStores } from "../../../stores/RootStore";
import {
    CathyRaisedButton,
    CathyTextButton,
} from "../../../shared-components/cathy/CathyButton";
import { NavigationService } from "../../../navigators/NavigationService";
import { AuthenticateStore } from "../../../stores/AuthenticateStore";
import { Spinner } from "../../../shared-components/Spinner";
import NoneMfaConfirmModal from "./modal/NoneMfaConfirmModal";
import { CognitoSessionStore } from "../../../stores/CognitoSessionStore";

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
    navigation: NavigationScreenProp<NavigationRoute>;
    rootStore: RootStore;
    authenticationStore: AuthenticateStore;
    sessionStore: CognitoSessionStore;
}
interface State {
    modalVisible: boolean;
    mfaOptionList: MfaTypeList[];
    currentMFA: string;
}

@inject(({ rootStore }: AllStores) => ({
    rootStore,
    authenticationStore: rootStore.authenticateStore,
    sessionStore: rootStore.cognitoSessionStore,
}))
@observer
export class ProfileMfaSettingsScreen extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            modalVisible: false,
            mfaOptionList: [],
            currentMFA: "",
        };
        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.handleSelectTOTP = this.handleSelectTOTP.bind(this);
        this.onClearAll = this.onClearAll.bind(this);
        this.setModalVisible = this.setModalVisible.bind(this);
    }

    static navigationOptions: NavigationScreenConfig<NavigationStackScreenOptions> =
        ({ navigation }) => {
            return {
                title: I18n.t("profile.item.mfa_setting"),
            };
        };

    componentDidMount(): void {
        this.props.authenticationStore.getUserData().then(() => {
            this.setState({
                currentMFA: this.props.authenticationStore.preferredMfaSetting,
            });
        });
        this.props.authenticationStore.getUserPoolMFAOptions();
    }
    private onChange(method: PreferMethod): void {
        this.props.authenticationStore.setPreferredMfaSetting(method);
    }
    private onSubmit(): void {
        let { authenticationStore } = this.props;

        if (authenticationStore.preferredMfaSetting === PreferMethod.None) {
            this.setModalVisible(true);
        } else if (
            authenticationStore.preferredMfaSetting === PreferMethod.TOTP
        ) {
            this.handleSelectTOTP();
            // Implement form submission here for other cases
        } else if (
            authenticationStore.preferredMfaSetting === PreferMethod.SMS
        ) {
            this.handleSelectSMS();
        }
    }
    private setModalVisible(visible: boolean): void {
        this.setState({ modalVisible: visible });
    }
    handleSelectTOTP() {
        this.props.authenticationStore.associateSoftwareToken();
        NavigationService.navigate("Auth/Login");
    }
    handleSelectSMS() {
        let smsMfaSettings = {
            PreferredMfa: true,
            Enabled: true,
        };
        this.props.authenticationStore.setUserMfaPreference(
            smsMfaSettings,
            null
        );
    }
    private onClearAll() {
        this.setState({
            currentMFA: "",
        });
        this.setModalVisible(false);
        let totpMfaSettings = {
            PreferredMfa: false,
            Enabled: false,
        };
        let smsMfaSettings = {
            PreferredMfa: false,
            Enabled: false,
        };
        this.props.authenticationStore.setUserMfaPreference(
            smsMfaSettings,
            totpMfaSettings
        );
    }
    render() {
        let { preferredMfaSetting, isFetching, userPoolMFAOption } =
            this.props.authenticationStore;
        // Determine which MFA options are available based on userPoolMFAOption
        let mfaOptionList: MfaTypeList[] = [];
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
                        {I18n.t("auth.mfa.settings_label")}
                    </Text>
                    <Select
                        style={styles.languageSelect}
                        triggerTextStyle={styles.languageTriggerText}
                        selectedValue={preferredMfaSetting}
                        onValueChange={(value) => {
                            this.onChange(value);
                        }}
                    >
                        {mfaOptionList.map((option, index) => (
                            <Select.Item
                                key={index}
                                label={I18n.t(option.label)}
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
                        onPress={this.onSubmit}
                        disabled={preferredMfaSetting == this.state.currentMFA}
                    />
                </View>

                <NoneMfaConfirmModal
                    setModalVisible={this.setModalVisible}
                    onClearAll={this.onClearAll}
                    modalVisible={this.state.modalVisible}
                ></NoneMfaConfirmModal>
            </View>
        );
    }
}

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
