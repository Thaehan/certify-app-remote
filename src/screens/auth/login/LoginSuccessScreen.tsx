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
import React, {
    PureComponent,
    Fragment
} from 'react';
import {
    Image,
    View,
    Alert,
    Linking,
    Dimensions,
    StyleSheet,
} from 'react-native';
import { inject } from 'mobx-react';
import { NavigationScreenProp, NavigationRoute } from 'react-navigation';
import { I18n } from '../../../utils/I18n';
import { AllStores } from '../../../stores/RootStore';
import { CognitoSessionStore } from '../../../stores/CognitoSessionStore';
import { CallbackStore } from '../../../stores/CallbackStore';
import { AppListStore } from '../../../stores/AppListStore';
import { TextFix } from '../../../shared-components/cathy/IOSFix';
import { cathyViews } from '../../../shared-components/cathy/CommonViews';
import { AuthenticateStore } from "../../../stores/AuthenticateStore";
import { BiometricStore } from "../../../stores/BiometricStore";

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
 * @author Lingqi
 */
@inject(({ rootStore }: AllStores) => ({
    sessionStore: rootStore.cognitoSessionStore,
    callbackStore: rootStore.callbackStore,
    appListStore: rootStore.appListStore,
    authenticateStore: rootStore.authenticateStore,
    biometricStore: rootStore.biometricStore
}))
export class LoginSuccessScreen extends PureComponent<Props> {

    static defaultProps = {
        authenticateStore: undefined,
        sessionStore: undefined,
        callbackStore: undefined,
        appListStore: undefined,
        biometricStore: undefined,
    };

    constructor(props: Props) {
        super(props);
    }

    //**************************************************************
    // Component Lifecycle
    //****************************************************************

    componentDidMount() {
        const { navigation, callbackStore, appListStore, authenticateStore, biometricStore } = this.props;

        authenticateStore.addBiometricFunctionality().then(isAdded => {
            if (biometricStore.isFirstBioSetup) {
                const bioType = I18n.t(`auth.biometrics.${biometricStore.bioLocalisationKey}`);
                this.showAlert(
                    I18n.t("auth.biometrics.setup_successful_title", { bioType: bioType }),
                    I18n.t("auth.biometrics.setup_successful_subtitle", { bioType: bioType }),
                );
            }
            if (callbackStore.sessionId) {
                callbackStore.getOutboundLink()
                    .then((redirectUrl) => {
                        this.openUrl(redirectUrl);
                    })
                    .catch((reason: string) => {
                        this.showAlert(I18n.t('alert.title.error'), reason);
                    });
            } else {
                appListStore.fetchAppList()
                    .then()
                    .catch((reason) => {
                        console.log(reason);
                    });
                navigation.navigate('Main/Home');
            }
        });
    }

    //**************************************************************
    // Other Methods
    //****************************************************************

    private openUrl(url: string): void {
        const { navigation, callbackStore } = this.props;
        setTimeout(() => {
            Linking.openURL(url).then(() => {
                callbackStore.clearCallback();
                navigation.navigate('Splash');
            }).catch(() => {
                this.showAlert(
                    I18n.t('alert.title.error'),
                    I18n.t('error.not_installed', { appName: callbackStore.appName })
                );
            });
        }, 1000);
    }

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
        const { sessionStore, callbackStore } = this.props;
        return (
            <Fragment>
                <View style={styles.topSpace} />
                <Image
                    style={styles.successImage}
                    source={require('../../../assets/image/auth/success.png')}
                    resizeMode={'contain'} />
                <View style={styles.middleSpace1} />
                <TextFix style={cathyViews.title}>
                    {I18n.t('auth.login.success_title')}
                </TextFix>
                <TextFix style={[cathyViews.title, styles.subtitle]}>
                    {I18n.t('auth.login.success_subtitle', { name: sessionStore.displayName() })}
                </TextFix>
                {
                    callbackStore.sessionId &&
                    <TextFix style={[cathyViews.subtitle, styles.successInfo]}>
                        {I18n.t('auth.login.success_info', { appName: callbackStore.appName })}
                    </TextFix>
                }
                <View style={styles.bottomSpace} />
            </Fragment>
        );
    }
}

const screenHeight = Dimensions.get('screen').height;
const styles = StyleSheet.create({
    topSpace: {
        height: 100 * (screenHeight - 222) / 509,
    },
    successImage: {
        alignSelf: 'center',
        width: 83,
        height: 102,
    },
    middleSpace1: {
        height: 28 * (screenHeight - 222) / 509,
        minHeight: 16,
    },
    subtitle: {
        marginTop: 8,
    },
    successInfo: {
        marginTop: 8,
    },
    bottomSpace: {
        flex: 1, // 381
    },
});
