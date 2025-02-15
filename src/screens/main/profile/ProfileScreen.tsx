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
import React, { PureComponent, Fragment } from 'react';
import {
    View,
    ScrollView,
    Image,
    Text,
    ImageSourcePropType,
    StyleSheet,
    Platform,
    Switch,
    Alert,
} from 'react-native';
import { inject, observer } from 'mobx-react';
import { NavigationScreenProp, NavigationRoute } from 'react-navigation';
import { I18n } from '../../../utils/I18n';
import { Colors } from '../../../utils/Colors';
import { WEB_URLS } from '../../../utils/Constants';
import { AllStores } from '../../../stores/RootStore';
import { CognitoSessionStore } from '../../../stores/CognitoSessionStore';
import { MaterialButton } from '../../../shared-components/MaterialButton';
import { SafeAreaFix } from '../../../shared-components/cathy/IOSFix';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faFingerprint } from '@fortawesome/free-solid-svg-icons';
import { BiometricStore } from "../../../stores/BiometricStore";

interface Props {
    navigation: NavigationScreenProp<NavigationRoute>;
    sessionStore: CognitoSessionStore;
    biometricStore: BiometricStore;
}

@inject(({ rootStore }: AllStores) => ({
    sessionStore: rootStore.cognitoSessionStore,
    biometricStore: rootStore.biometricStore
}))
@observer
export class ProfileScreen extends PureComponent<Props> {
    static defaultProps = {
        biometricStore: undefined
    };

    constructor(props: Props) {
        super(props);
        this.onPressPassword = this.onPressPassword.bind(this);
        this.onPressSettings = this.onPressSettings.bind(this);
        this.onPressHelp = this.onPressHelp.bind(this);
        this.onPressLogout = this.onPressLogout.bind(this);
        this.onPressAbout = this.onPressAbout.bind(this);
        this.onValueChangedBiometric = this.onValueChangedBiometric.bind(this);
        this.onPressMfaSettings = this.onPressMfaSettings.bind(this);
    }

    //**************************************************************
    // Button Callbacks
    //****************************************************************

    private onPressPassword(): void {
        this.props.navigation.navigate('Main/Profile/Password');
    }

    private onPressSettings(): void {
        this.props.navigation.navigate('Main/Profile/Settings');
    }

    private onPressMfaSettings(): void {
        this.props.navigation.navigate('Main/Profile/MFA');
    }

    private onPressHelp(): void {
        this.props.navigation.navigate('Main/Profile/Web', {
            title: I18n.t('auth.menu.help'),
            webUrl: WEB_URLS.help
        });
    }

    private onPressAbout(): void {
        this.props.navigation.navigate('Main/Profile/About');
    }

    private onPressLogout(): void {
        const { navigation, sessionStore } = this.props;
        sessionStore.signOut();
        navigation.navigate('Auth/Login', { isSignOut: true });
    }

    private onValueChangedBiometric(value: boolean): void {
        const { biometricStore } = this.props;
        biometricStore.configBiometrics(value);
        if (biometricStore.isBioSystemReady && value) {
            const bioType = I18n.t(`auth.biometrics.${biometricStore.bioLocalisationKey}`);
            this.showAlert(
                I18n.t("auth.biometrics.enable_successful_title", { bioType: bioType } ),
                I18n.t("auth.biometrics.enable_successful_subtitle", { bioType: bioType }),
            );
        }
        else if (!biometricStore.isBioSystemReady && value) {
            const bioType = I18n.t(`auth.biometrics.${biometricStore.savedBioType}`);
            this.showAlert(
                I18n.t("auth.biometrics.cannot_enable_title", { bioType: bioType } ),
                I18n.t("auth.biometrics.cannot_enable_subtitle", { bioType: bioType }),
            );
        }
    }

    //**************************************************************
    // Other Methods
    //****************************************************************
    private showAlert(title: string, message: string): void {
        setTimeout(() => {
            Alert.alert(
                title,
                message,
                [{ text: I18n.t('alert.button.ok'), style: 'cancel' }],
                { cancelable: false },
            );
        }, 100);
    }

    //**************************************************************
    // Render
    //****************************************************************

    render() {
        const { sessionStore, biometricStore } = this.props;

        const bioType = biometricStore.bioLocalisationKey;
        const savedBioType = biometricStore.savedBioType;
        let bioTypeWithLocale = 'None'
        if (bioType != 'None') {
            bioTypeWithLocale = I18n.t(`auth.biometrics.${bioType}`);
        }
        else if (savedBioType != 'None') {
            bioTypeWithLocale = I18n.t(`auth.biometrics.${savedBioType}`);
        }
        return (
            <SafeAreaFix
                statusBarColor={Colors.cathyBlue}
                containerColor={'white'}>
                <ScrollView
                    style={styles.container}
                    bounces={false}>
                    <View style={styles.profileHeader}>
                        <Image
                            style={styles.profileHeaderAvatar}
                            source={require('../../../assets/image/placeholder-avatar.png')}
                            resizeMode={'cover'} />
                        <Text style={styles.profileHeaderName}>
                            {this.props.sessionStore?.currentCognitoUser?.getUsername() ||
                                    ""}
                        </Text>
                    </View>
                    <ProfileItem
                        icon={require('../../../assets/image/icon/info.png')}
                        title={I18n.t('profile.item.about')}
                        onPress={this.onPressAbout} />
                    <ProfileItem
                        icon={require('../../../assets/image/icon/key.png')}
                        title={I18n.t('profile.item.password')}
                        onPress={this.onPressPassword} />
                    <ProfileItem
                        icon={require('../../../assets/image/icon/mfa_settings.png')}
                        title={I18n.t('profile.item.mfa_setting')}
                        onPress={this.onPressMfaSettings} />
                    <ProfileItem
                        icon={require('../../../assets/image/icon/settings.png')}
                        title={I18n.t('profile.item.settings')}
                        onPress={this.onPressSettings} />
                    <ProfileItem
                        icon={require('../../../assets/image/icon/help.png')}
                        title={I18n.t('auth.menu.help')}
                        onPress={this.onPressHelp} />
                    {   bioTypeWithLocale != 'None' &&
                        <Fragment>
                            <View style={styles.profileDivider} />r
                            <View style={styles.bioSwitchContainer}>
                                <FontAwesomeIcon icon={faFingerprint} size={18} style={styles.bioSwitchIcon}></FontAwesomeIcon>
                                <Text style={styles.bioSwitchLabel}>{bioTypeWithLocale}</Text>
                                <Switch style={styles.bioSwitch}
                                        value={
                                            biometricStore.isBioEnabledByUser
                                            && biometricStore.isBioReady
                                            && !biometricStore.isLockedOut
                                        }
                                        onValueChange={this.onValueChangedBiometric}/>
                            </View>
                        </Fragment>
                    }
                    <View style={styles.profileDivider} />
                    <MaterialButton
                        style={styles.profileItem}
                        contentStyle={styles.profileItemContent}
                        rippleColor={Colors.blackOverlay}
                        onPress={this.onPressLogout}>
                        <Image
                            style={styles.profileItemIcon}
                            source={require('../../../assets/image/icon/power.png')}
                            resizeMode={'cover'} />
                        <Text style={[styles.profileItemText, styles.logoutText]}>
                            {I18n.t('profile.item.logout')}
                        </Text>
                    </MaterialButton>
                </ScrollView>
            </SafeAreaFix>
        );
    }
}

interface ItemProps {
    icon: ImageSourcePropType;
    title: string;
    onPress: () => void;
}

class ProfileItem extends PureComponent<ItemProps> {
    render() {
        return (
            <MaterialButton
                style={styles.profileItem}
                contentStyle={styles.profileItemContent}
                rippleColor={Colors.blackOverlay}
                onPress={this.props.onPress}>
                <Image
                    style={styles.profileItemIcon}
                    source={this.props.icon}
                    resizeMode={'cover'} />
                <Text style={styles.profileItemText}>
                    {this.props.title}
                </Text>
            </MaterialButton>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'whitesmoke'
    },
    profileHeader: {
        height: 180,
        marginBottom: 8,
        backgroundColor: Colors.cathyBlue,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            android: {
                elevation: 4,
                borderBottomWidth: Platform.Version < 21 ? 1 : undefined,
                borderBottomColor: Platform.Version < 21 ? Colors.darkDivider : undefined
            },
            ios: {
                shadowColor: 'black',
                shadowOpacity: 0.24,
                shadowRadius: 4,
                shadowOffset: {
                    width: 0,
                    height: 3,
                },
            }
        })
    },
    profileHeaderAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    profileHeaderName: {
        marginTop: 8,
        fontSize: 14,
        fontFamily: 'Roboto-Medium',
        letterSpacing: 0.5,
        lineHeight: 16,
        color: 'white'
    },
    profileItem: {
        height: 56,
    },
    profileItemContent: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    profileItemIcon: {
        marginLeft: 16,
        width: 24,
        height: 24,
        tintColor: Colors.unfocusedIcon
    },
    profileItemText: {
        marginLeft: 32,
        fontSize: 16,
        fontFamily: 'Roboto-Regular',
        letterSpacing: 0.5,
        color: Colors.majorText
    },
    profileDivider: {
        height: 1,
        marginVertical: 8,
        marginHorizontal: 16,
        backgroundColor: Colors.darkDivider
    },
    logoutText: {
        color: Colors.matRed
    },
    bioSwitchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56
    },
    bioSwitchLabel: {
        flexGrow: 1,
        marginLeft: 34,
        fontSize: 16,
        fontFamily: 'Roboto-Regular',
        letterSpacing: 0.5,
        color: Colors.majorText,
    },
    bioSwitch: {
        marginLeft: 32,
        marginRight: 24
    },
    bioSwitchIcon: {
        marginLeft: 19,
        color: Colors.unfocusedIcon
    },
});
