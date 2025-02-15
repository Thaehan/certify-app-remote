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
    SafeAreaView,
    StatusBar,
    BackHandler,
    Platform,
    StyleSheet,
} from 'react-native';
import {
    NavigationScreenProp,
    NavigationRoute,
    NavigationScreenConfig,    
    NavigationEventSubscription,
    NavigationEventPayload
} from 'react-navigation';

import { HeaderBackButton } from 'react-navigation-stack'
import {
    WebView,
    WebViewNavigation,
} from 'react-native-webview';
import { Colors } from '../utils/Colors';
import { WebSpinner } from '../shared-components/Spinner';
import { CathyIconButton } from '../shared-components/cathy/CathyButton';

interface Props {
    navigation: NavigationScreenProp<NavigationRoute>;
}
interface State {
    isLoading: boolean;
}

export class WebScreen extends PureComponent<Props, State> {

    private webView!: WebView;
    private willFocusSubs!: NavigationEventSubscription;
    private willBlurSubs!: NavigationEventSubscription;

    private canGoBack: boolean;
    private webUrl: string;

    constructor(props: Props) {
        super(props);
        this.canGoBack = false;
        this.state = {
            isLoading: true,
        };
        this.webUrl = props.navigation.getParam('webUrl');
        this.onWillFocus = this.onWillFocus.bind(this);
        this.onWillBlur = this.onWillBlur.bind(this);
        this.onNavigationStateChange = this.onNavigationStateChange.bind(this);
        this.onBackPressed = this.onBackPressed.bind(this);
        this.onPressClose = this.onPressClose.bind(this);
    }

    static navigationOptions: NavigationScreenConfig<any> = ({ navigation }) => {
        return {
            title: navigation.getParam('title'),
            headerTintColor: 'white',
            headerStyle: {
                backgroundColor: Colors.cathyBlue
            },
            headerLeft: (
                <HeaderBackButton
                    backTitleVisible={Platform.OS === 'ios'}
                    tintColor={'white'}
                    pressColorAndroid={Colors.whiteOverlay}
                    onPress={navigation.getParam('onBackPressed')} />
            ),
            headerRight: (
                <CathyIconButton
                    iconSource={require('../assets/image/icon/close.png')}
                    tintColor={'white'}
                    onPress={navigation.getParam('onPressClose')} />
            ),
        };
    }

    //**************************************************************
    // Component Lifecycle
    //****************************************************************

    componentDidMount(): void {
        const { navigation } = this.props;
        navigation.setParams({
            onBackPressed: this.onBackPressed,
            onPressClose: this.onPressClose,
        });
        this.willFocusSubs = navigation.addListener('willFocus', this.onWillFocus);
        this.willBlurSubs = navigation.addListener('willBlur', this.onWillBlur);
    }

    componentWillUnmount() {
        this.willFocusSubs.remove();
        this.willBlurSubs.remove();
        BackHandler.removeEventListener('hardwareBackPress', this.onBackPressed);
    }

    //**************************************************************
    // Navigation Lifecycle
    //****************************************************************

    onWillFocus(payload: NavigationEventPayload) {
        BackHandler.addEventListener('hardwareBackPress', this.onBackPressed);
    }

    onWillBlur(payload: NavigationEventPayload) {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackPressed);
    }

    //**************************************************************
    // WebView Callbacks
    //****************************************************************

    private onNavigationStateChange(event: WebViewNavigation): void {
        this.canGoBack = event.canGoBack;
        if (event.title) {
            // this.props.navigation.setParams({ title: event.title });
        }
        if (event.loading !== this.state.isLoading) {
            this.setState({ isLoading: event.loading });
        }
    }

    //**************************************************************
    // Button Callbacks
    //****************************************************************

    private onBackPressed(): boolean {
        if (this.canGoBack) {
            this.webView.goBack();
        } else {
            this.props.navigation.goBack();
        }
        return true;
    }

    private onPressClose(): void {
        this.props.navigation.goBack();
    }

    //**************************************************************
    // Render
    //****************************************************************

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar
                    barStyle={'light-content'}
                    backgroundColor={Colors.cathyBlueDark} />
                <WebView
                    ref={(webView) => this.webView = webView!}
                    style={styles.webView}
                    bounces={false}
                    source={{ uri: this.webUrl }}
                    onNavigationStateChange={this.onNavigationStateChange} />
                {this.state.isLoading &&
                    <WebSpinner />
                }
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    webView: {
        flex: 1,
        backgroundColor: 'whitesmoke'
    },
});
