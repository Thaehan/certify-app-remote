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
    Component,
    Fragment
} from 'react';
import {
    Linking,
    StatusBar,
    Platform,
    AppState,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { inject, observer } from 'mobx-react';
import { NavigationContainerComponent } from 'react-navigation';
import * as RNLocalize from 'react-native-localize';
import URI from 'urijs';
import { AppSwitch } from './navigators/AppSwitch';
import { NavigationService } from './navigators/NavigationService';
import { I18n } from './utils/I18n';
import { Colors } from './utils/Colors';
import { Keys } from './utils/Constants';
import { RootStore, AllStores } from './stores/RootStore';
import { UserPoolStore } from './stores/UserPoolStore';
import { CognitoSessionStore } from './stores/CognitoSessionStore';
import { CallbackStore } from './stores/CallbackStore';
import { MenuProvider } from 'react-native-popup-menu';
import { BiometricStore } from "./stores/BiometricStore";
import { SafeAreaProvider } from 'react-native-safe-area-view';


import 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
interface Props {
    rootStore: RootStore;
    userPoolStore: UserPoolStore;
    sessionStore: CognitoSessionStore;
    callbackStore: CallbackStore;
    biometricStore: BiometricStore;
}

interface State {
    appState: string;
}

/**
 * Root Component of the application
 *
 * @author Lingqi
 */
@inject(({ rootStore }: AllStores) => ({
    rootStore,
    userPoolStore: rootStore.userPoolStore,
    sessionStore: rootStore.cognitoSessionStore,
    callbackStore: rootStore.callbackStore,
    biometricStore: rootStore.biometricStore,
}))
@observer
export class App extends Component<Props, State> {
    private languageCalled: boolean;
    urlListener: any;

    constructor(props: Props) {
        super(props);
        this.state = {
            appState: AppState.currentState
        };
        this.languageCalled = false;
        this.handleInboundLink = this.handleInboundLink.bind(this);
        this.handleLanguageChange = this.handleLanguageChange.bind(this);
        this.handleAppStateChange = this.handleAppStateChange.bind(this);
    }

    //**************************************************************
    // App Lifecycle
    //****************************************************************

    componentDidMount() {
        AppState.addEventListener('change', this.handleAppStateChange);
        this.urlListener = Linking.addEventListener('url', this.handleInboundLink);
        Linking.getInitialURL().then((url) => {
            if (url) {
                this.handleInboundLink({url});
            }
        });
        RNLocalize.addEventListener('change', this.handleLanguageChange);
        // iOS need to call manually. Android depends
        setTimeout(() => {
            this.handleLanguageChange();
        }, 10);
    }

    componentWillUnmount() {
        // AppState.remove();
        this.urlListener.remove();
        // RNLocalize.remove();
        
    }

    //**************************************************************
    // handle App event
    //****************************************************************

    private handleAppStateChange(nextAppState: string) {
        if (this.state.appState.match(/inactive|background/) &&
            nextAppState === "active") {
            console.log("App has come to the foreground!");
            const { biometricStore } =  this.props;
            biometricStore.refreshBiometricState();
        }
        this.setState({
            appState: nextAppState
        });
    }

    private handleInboundLink(event: {url: string}): void {
        const { userPoolStore, sessionStore, callbackStore } = this.props;
        NavigationService.navigate('Splash');
        const uri = new URI(event.url);
        const queryMap = uri.query(true) as { [key: string]: string };
        const data = queryMap['d'];
        const sign = queryMap['s'];
        if (data && sign) {
            callbackStore.handleInboundLink(data, sign).then((query) => {
                const userPoolId = query['ui'];
                const clientId = query['ci'];
                const accountId = query['ac'];
                userPoolStore.initUserPool(userPoolId, clientId, accountId);
                if (callbackStore.selectedApp) {
                    sessionStore.getCachedSession()
                        .then((session) => {
                            callbackStore.getOutboundLink().then((redirectUrl) => {
                                Linking.openURL(redirectUrl).then(() => {
                                    callbackStore.clearCallback();
                                    NavigationService.navigate('Main');
                                });
                            });
                        })
                        .catch((reason) => {
                            callbackStore.clearCallback();
                        });
                } else {
                    AsyncStorage.getItem(Keys.INTRO_DONE).then((isDone) => {
                        if (JSON.parse(isDone as string)) {
                            sessionStore.getCachedSession()
                                .then((session) => {                                    
                                    NavigationService.navigate('Auth/SSO');
                                })
                                .catch((reason) => {
                                    NavigationService.navigate('Auth/Login');
                                });
                        } else {
                            NavigationService.navigate('Intro');
                        }
                    });
                }
            }).catch((reason) => {
                console.log(reason);
            });
        }
    }

    private handleLanguageChange(): void {
        const { rootStore } = this.props;
        if (this.languageCalled) {
            return;
        }
        this.languageCalled = true;
        AsyncStorage.getItem(Keys.SYSTEM_LANGUAGE).then((savedSystemLang) => {
            const locales = RNLocalize.getLocales();
            const systemLang = I18n.matchedSystemLang(locales);
            if (systemLang !== savedSystemLang) {
                AsyncStorage.multiSet([
                    [Keys.SYSTEM_LANGUAGE, systemLang],
                    [Keys.LANGUAGE, systemLang],
                ]);
                rootStore.useLang(systemLang);
            } else {
                AsyncStorage.getItem(Keys.LANGUAGE).then((userLang) => {
                    rootStore.useLang(userLang || 'en');
                });
            }
        });
    }

    //**************************************************************
    // Render
    //****************************************************************

    render() {
        const { rootStore } = this.props;
        const statusBarFix = Platform.OS === 'android' && Platform.Version < 23;
        return (
          <MenuProvider skipInstanceCheck={true}>
                <SafeAreaProvider><Fragment>
                <StatusBar
                    translucent={Platform.OS === 'ios'}
                    backgroundColor={statusBarFix ? '#8BA4B2' : Colors.cathyBlueBg}
                    barStyle={'dark-content'} />
                <AppSwitch
                    ref={(navigatorRef: NavigationContainerComponent) => {
                        NavigationService.setTopLevelNavigator(navigatorRef);
                    }}
                    screenProps={{ currentLang: rootStore.currentLang }}
                    enableURLHandling={false} />
            </Fragment>
            <Toast/>
           </SafeAreaProvider>
        </MenuProvider>
        );
    }
}
