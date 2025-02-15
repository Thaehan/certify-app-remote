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
import React, { PureComponent } from 'react';
import {
    View,
    Image,
    StyleSheet,
    NativeSyntheticEvent,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { inject } from 'mobx-react';
import { NavigationScreenProp, NavigationRoute } from 'react-navigation';
import ViewPager, { ViewPagerOnPageSelectedEventData } from 'react-native-pager-view';
import LinearGradient from 'react-native-linear-gradient';
import { I18n } from '../../utils/I18n';
import { Colors } from '../../utils/Colors';
import { Keys } from '../../utils/Constants';
import { AllStores } from '../../stores/RootStore';
import { UserPoolStore } from '../../stores/UserPoolStore';
import { IntroChildScreen } from './child/IntroChildScreen';
import { PageIndicator } from './child/PageIndicator';
import { SafeAreaFix } from '../../shared-components/cathy/IOSFix';

interface Props {
    navigation: NavigationScreenProp<NavigationRoute>;
    userPoolStore: UserPoolStore;
}

/**
 * Intro screens when first launch
 *
 * @author Lingqi
 */
@inject(({ rootStore }: AllStores) => ({
    userPoolStore: rootStore.userPoolStore
}))
export class IntroScreen extends PureComponent<Props> {

    private viewPager!: ViewPager;
    private pageIndicator!: PageIndicator;

    constructor(props: Props) {
        super(props);
        this.onPressLogin = this.onPressLogin.bind(this);
        this.onPageSelected = this.onPageSelected.bind(this);
        this.onIndicatorPress = this.onIndicatorPress.bind(this);
    }

    private onPressLogin(): void {
        const { navigation, userPoolStore } = this.props;
        AsyncStorage.setItem(Keys.INTRO_DONE, JSON.stringify(true));
        if (userPoolStore.isUserPoolInited()) {
            navigation.navigate('Auth/Login');
        } else {
            navigation.navigate('Splash');
        }
    }

    private onPageSelected(event: NativeSyntheticEvent<ViewPagerOnPageSelectedEventData>): void {
        const index = event.nativeEvent.position;
        this.pageIndicator.setCurrentPage(index);
    }

    private onIndicatorPress(index: number): void {
        this.viewPager.setPage(index);
    }

    render() {
        return (
            <SafeAreaFix
                statusBarColor={Colors.cathyBlueBg}
                containerColor={'white'}>
                <LinearGradient
                    style={styles.container}
                    colors={[Colors.cathyBlueBg, 'white']}>
                    <ViewPager
                        ref={(viewPager) => this.viewPager = viewPager!}
                        style={styles.container}
                        initialPage={0}
                        onPageSelected={this.onPageSelected}>
                        <View key={0}>
                            <IntroChildScreen
                                title={I18n.t('intro.title1')}
                                subtitle={I18n.t('intro.subtitle1')}
                                iconImage={(
                                    <Image
                                        style={styles.icon1}
                                        source={require('../../assets/image/intro/intro1.png')}
                                        resizeMode={'contain'} />
                                )} />
                        </View>
                        <View key={1}>
                            <IntroChildScreen
                                title={I18n.t('intro.title2')}
                                subtitle={I18n.t('intro.subtitle2')}
                                iconImage={(
                                    <Image
                                        style={styles.icon2}
                                        source={require('../../assets/image/intro/intro2.png')}
                                        resizeMode={'contain'} />
                                )} />
                        </View>
                        <View key={2}>
                            <IntroChildScreen
                                title={I18n.t('intro.title3')}
                                subtitle={I18n.t('intro.subtitle3')}
                                iconImage={(
                                    <Image
                                        style={styles.icon3}
                                        source={require('../../assets/image/intro/intro3.png')}
                                        resizeMode={'contain'} />
                                )}
                                showLoginButton={true}
                                onPressLogin={this.onPressLogin} />
                        </View>
                    </ViewPager>
                    <PageIndicator
                        ref={(pageIndicator) => this.pageIndicator = pageIndicator!}
                        numberOfPages={3}
                        pageIndicatorTintColor={Colors.cathyMajorText}
                        currentPageIndicatorTintColor={Colors.cathyOrange}
                        indicatorRadius={5}
                        onIndicatorPress={this.onIndicatorPress} />
                </LinearGradient>
            </SafeAreaFix>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    icon1: {
        width: 131,
        height: 134,
    },
    icon2: {
        width: 163,
        height: 137,
    },
    icon3: {
        width: 167,
        height: 119,
    },
});
