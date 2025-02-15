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
    Fragment,
} from 'react';
import { inject } from 'mobx-react';
import {
    NavigationScreenProp,
    NavigationRoute,
    NavigationEventSubscription,
    NavigationEventPayload,
} from 'react-navigation';
import {
    StatusBar,
    Platform,
    View,
    Modal,
    StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


import {
    AndroidNavigationBar,
    AndroidKeyboardMode,
} from '../nativeUtils/NativeModules';
import { Environment } from '../utils/Environment';
import { Colors } from '../utils/Colors';
import { Keys } from '../utils/Constants';
import { AllStores } from '../stores/RootStore';
import { UserPoolStore } from '../stores/UserPoolStore';
import { CognitoSessionStore } from '../stores/CognitoSessionStore';
import { CallbackStore } from '../stores/CallbackStore';
import { SafeAreaFix } from '../shared-components/cathy/IOSFix';
import { CathyRaisedButton, CathyTextButton } from '../shared-components/cathy/CathyButton';
import { AuthenticateStore } from '../stores/AuthenticateStore';

interface Props {
    navigation: NavigationScreenProp<NavigationRoute>;
    userPoolStore: UserPoolStore;
    sessionStore: CognitoSessionStore;
    callbackStore: CallbackStore;
    authenticateStore: AuthenticateStore;
}
interface State {
    modalVisible: boolean;
}

/**
 * Component used as splash screen
 *
 * @author Lingqi
 */
@inject(({ rootStore }: AllStores) => ({
    userPoolStore: rootStore.userPoolStore,
    sessionStore: rootStore.cognitoSessionStore,
    callbackStore: rootStore.callbackStore,    
    authenticateStore: rootStore.authenticateStore,

}))
export class SplashScreen extends PureComponent<Props, State> {

    private didFocusSubs!: NavigationEventSubscription;

    constructor(props: Props) {
        super(props);
        this.state = {
            modalVisible: false,
        };
        this.onDidFocus = this.onDidFocus.bind(this);
        this.onPressSG = this.onPressSG.bind(this);
        this.onPressHK = this.onPressHK.bind(this);
        this.onPressAU = this.onPressAU.bind(this);
    }

    private set modalVisible(modalVisible: boolean) {
        this.setState({ modalVisible });
        if (Platform.OS === 'android') {
            const color = modalVisible ? '#52000000' : '#00000000';
            AndroidNavigationBar.setNavigationBarColor(color);
        }
    }
    private get modalVisible(): boolean {
        return this.state.modalVisible;
    }

    //**************************************************************
    // Component Lifecycle
    //****************************************************************

    componentDidMount() {
        this.didFocusSubs = this.props.navigation.addListener('didFocus', this.onDidFocus);
    }

    componentWillUnmount() {
        this.didFocusSubs.remove();
        if (Platform.OS === 'android') {
            if (Platform.Version >= 26) {
                AndroidNavigationBar.setNavigationBarColor('white');
                AndroidNavigationBar.setLightNavigationBar(true);
            } else {
                AndroidNavigationBar.setNavigationBarColor('black');
            }
            AndroidKeyboardMode.setAdjustOption('adjustPan');
        }
    }

    //**************************************************************
    // Navigation Lifecycle
    //****************************************************************

    onDidFocus(payload: NavigationEventPayload): void {
        setTimeout(() => {
            const { navigation, userPoolStore, callbackStore } = this.props;
            if (callbackStore.sessionId) {
                return;
            }
            AsyncStorage.getItem(Keys.INTRO_DONE).then((isDone) => {
                if (!JSON.parse(isDone as string)) {
                    navigation.navigate('Intro');
                    return;
                }
                userPoolStore.loadCachedUserPool().then((success) => {
                    if (success) {
                        this.navigateToScreen();
                    } else {
                        this.modalVisible = true;
                    }
                });
            });
        }, 50);
    }

    //**************************************************************
    // Other Methods
    //****************************************************************

    private onPressSG(): void {
        this.modalVisible = false;
        this.props.userPoolStore.initUserPool(
            Environment.sg.userPoolId,
            Environment.sg.clientId,
            Environment.sg.accountId
        );
        setTimeout(() => {
            this.navigateToScreen();
        }, 50);
    }

    private onPressHK(): void {
        this.modalVisible = false;
        this.props.userPoolStore.initUserPool(
            Environment.hk.userPoolId,
            Environment.hk.clientId,
            Environment.hk.accountId
        );
        setTimeout(() => {
            this.navigateToScreen();
        }, 50);
    }

    private onPressAU(): void {
        this.modalVisible = false;
        this.props.userPoolStore.initUserPool(
            Environment.au.userPoolId,
            Environment.au.clientId,
            Environment.au.accountId
        );
        setTimeout(() => {
            this.navigateToScreen();
        }, 50);
    }

    private navigateToScreen(): void {
        const { navigation, sessionStore, authenticateStore } = this.props;
        sessionStore.getCachedSession()
            .then(async() => {
                let isSetupPrefer = await authenticateStore.isSetPreferMethod();
                if(isSetupPrefer){
                    navigation.navigate('Main');
                }else{
                    navigation.navigate('Auth/Login');
                    authenticateStore.setLoginStep('SelectPreferMethod')
                }
            })
            .catch(() => {
                navigation.navigate('Auth');
            });
    }

    //**************************************************************
    // Render
    //****************************************************************

    render() {
        return(
            <Fragment>
                <StatusBar
                    backgroundColor={'transparent'} />
                <Modal
                    animationType={'fade'}
                    transparent={true}
                    visible={this.modalVisible}
                    onRequestClose={() => { }}>
                    <StatusBar
                        animated={true}
                        backgroundColor={Colors.scrimColor} />
                    <SafeAreaFix
                        statusBarColor={Colors.scrimColor}
                        containerColor={Colors.scrimColor}>
                        <View style={styles.container}>
                            <View style={styles.selectorContainer}>
                                <CathyTextButton
                                    style={styles.sgButton}
                                    text={'Certis SG'}
                                    onPress={this.onPressSG} />
                                <CathyTextButton
                                    style={styles.hkButton}
                                    text={'Certis HK'}
                                    onPress={this.onPressHK} />
                                <CathyTextButton
                                    style={styles.auButton}
                                    text={'Certis AU'}
                                    onPress={this.onPressAU} />
                            </View>
                        </View>
                    </SafeAreaFix>
                </Modal>
            </Fragment>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Platform.OS === 'android' ? Colors.scrimColor : 'transparent'
    },
    selectorContainer: {
        marginTop: 80,
        width: 280,
        borderRadius: 4,
        backgroundColor: 'white',
        ...Platform.select({
            android: {
                elevation: 24,
                borderWidth: Platform.Version < 21 ? 1 : undefined,
                borderColor: Platform.Version < 21 ? Colors.darkDivider : undefined
            },
            ios: {
                shadowColor: 'black',
                shadowOpacity: 0.24,
                shadowRadius: 24,
                shadowOffset: {
                    width: 0,
                    height: 23,
                },
            }
        }),
    },
    sgButton: {
        marginTop: 24
    },
    hkButton: {
        marginTop: 24
    },
    auButton: {
        marginVertical: 24
    },
});
