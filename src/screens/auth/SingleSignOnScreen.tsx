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
import React, { PureComponent } from 'react';
import {
    View,
    Image,
    Alert,
    Linking,
    StyleSheet,
} from 'react-native';
import { inject } from 'mobx-react';
import { NavigationScreenProp, NavigationRoute } from 'react-navigation';
import LinearGradient from 'react-native-linear-gradient';
import { I18n } from '../../utils/I18n';
import { Colors } from '../../utils/Colors';
import { AllStores } from '../../stores/RootStore';
import { CognitoSessionStore } from '../../stores/CognitoSessionStore';
import { CallbackStore } from '../../stores/CallbackStore';
import { Spinner } from '../../shared-components/Spinner';
import { SafeAreaFix, TextFix } from '../../shared-components/cathy/IOSFix';
import {
    CathyRaisedButton,
    CathyTextButton,
} from '../../shared-components/cathy/CathyButton';
import { cathyViews } from '../../shared-components/cathy/CommonViews';

interface Props {
    navigation: NavigationScreenProp<NavigationRoute>;
    sessionStore: CognitoSessionStore;
    callbackStore: CallbackStore;
}
interface State {
    isFetching: boolean;
}

/**
 * Component display single sign on
 *
 * @author Lingqi
 */
@inject(({ rootStore }: AllStores) => ({
    sessionStore: rootStore.cognitoSessionStore,
    callbackStore: rootStore.callbackStore
}))
export class SingleSignOnScreen extends PureComponent<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            isFetching: false
        };
        this.onPressContinue = this.onPressContinue.bind(this);
        this.onPressAnother = this.onPressAnother.bind(this);
    }

    private onPressContinue(): void {
        const { callbackStore } = this.props;
        this.setState({ isFetching: true });
        callbackStore.getOutboundLink()
            .then((redirectUrl) => {
                this.setState({ isFetching: false });
                this.openUrl(redirectUrl);
            })
            .catch((reason) => {
                this.setState({ isFetching: false });
                this.showAlert(I18n.t('alert.title.error'), reason);
            });
    }

    private onPressAnother(): void {
        const { navigation, sessionStore } = this.props;
        sessionStore.signOut();
        navigation.navigate('Auth/Login');
    }

    private openUrl(url: string): void {
        const { navigation, callbackStore } = this.props;
        Linking.openURL(url).then(() => {
            callbackStore.clearCallback();
            navigation.navigate('Splash');
        }).catch(() => {
            this.showAlert(
                I18n.t('alert.title.error'),
                I18n.t('error.not_installed', { appName: callbackStore.appName })
            );
        });
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

    render() {
        const { sessionStore, callbackStore } = this.props;
        return (
            <SafeAreaFix
                statusBarColor={Colors.cathyBlueBg}
                containerColor={'white'}>
                <LinearGradient
                    style={styles.container}
                    colors={[Colors.cathyBlueBg, 'white']}>
                    <Spinner
                        isVisible={this.state.isFetching} />
                    <View style={styles.topSpace} />
                    <Image
                        style={styles.successImage}
                        source={require('../../assets/image/auth/success.png')}
                        resizeMode={'contain'} />
                    <View style={styles.middleSpace1} />
                    <TextFix style={cathyViews.title}>
                        {I18n.t('auth.sso.title')}
                    </TextFix>
                    <TextFix style={[cathyViews.subtitle, styles.successInfo]}>
                        {I18n.t('auth.sso.subtitle', { name: sessionStore.displayName() })}
                    </TextFix>
                    <View style={styles.middleSpace2} />
                    <CathyRaisedButton
                        text={I18n.t('auth.sso.continue_button', { appName: callbackStore.appName })}
                        onPress={this.onPressContinue} />
                    <View style={styles.middleSpace3} />
                    <CathyTextButton
                        text={I18n.t('auth.sso.another_button')}
                        onPress={this.onPressAnother} />
                    <View style={styles.bottomSpace} />
                    <Image
                        style={cathyViews.bottomLogo}
                        source={require('../../assets/image/logo.png')} />
                </LinearGradient>
            </SafeAreaFix>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topSpace: {
        flex: 92,
    },
    successImage: {
        alignSelf: 'center',
        width: 83,
        height: 102,
    },
    middleSpace1: {
        flex: 20,
    },
    successInfo: {
        marginTop: 4,
    },
    middleSpace2: {
        flex: 96,
    },
    middleSpace3: {
        height: 16,
    },
    bottomSpace: {
        flex: 245,
    },
});
