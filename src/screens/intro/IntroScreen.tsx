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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { inject, observer } from "mobx-react";
import React, { FC, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Image, NativeSyntheticEvent, StyleSheet, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import ViewPager from "react-native-pager-view";
import { SafeAreaFix } from "../../shared-components/cathy/IOSFix";
import { AllStores } from "../../stores/RootStore";
import { UserPoolStore } from "../../stores/UserPoolStore";
import { Colors } from "../../utils/Colors";
import { Keys } from "../../utils/Constants";
import { IntroChildScreen } from "./child/IntroChildScreen";
import { PageIndicator } from "./child/PageIndicator";

interface Props {
    navigation: any;
    userPoolStore: UserPoolStore;
}

/**
 * Intro screens when first launch
 *
 * @author Lingqi
 */
const IntroScreen: FC<Props> = inject(({ rootStore }: AllStores) => ({
    userPoolStore: rootStore.userPoolStore,
}))(
    observer(({ navigation, userPoolStore }) => {
        const viewPagerRef = useRef<ViewPager>(null);
        const pageIndicatorRef = useRef<PageIndicator>(null);

        const { t } = useTranslation();

        const onPressLogin = (): void => {
            AsyncStorage.setItem(Keys.INTRO_DONE, JSON.stringify(true));
            if (userPoolStore.isUserPoolInited()) {
                navigation.navigate("Auth/Login");
            } else {
                navigation.navigate("Splash");
            }
        };

        const onPageSelected = (event: NativeSyntheticEvent<any>): void => {
            const index = event.nativeEvent.position;
            pageIndicatorRef.current?.setCurrentPage(index);
        };

        const onIndicatorPress = (index: number): void => {
            viewPagerRef.current?.setPage(index);
        };

        return (
            <SafeAreaFix
                statusBarColor={Colors.cathyBlueBg}
                containerColor={"white"}
            >
                <LinearGradient
                    style={styles.container}
                    colors={[Colors.cathyBlueBg, "white"]}
                >
                    <ViewPager
                        ref={viewPagerRef}
                        style={styles.container}
                        initialPage={0}
                        onPageSelected={onPageSelected}
                    >
                        <View key={0}>
                            <IntroChildScreen
                                title={t("intro.title1")}
                                subtitle={t("intro.subtitle1")}
                                iconImage={
                                    <Image
                                        style={styles.icon1}
                                        source={require("../../assets/image/intro/intro1.png")}
                                        resizeMode={"contain"}
                                    />
                                }
                            />
                        </View>
                        <View key={1}>
                            <IntroChildScreen
                                title={t("intro.title2")}
                                subtitle={t("intro.subtitle2")}
                                iconImage={
                                    <Image
                                        style={styles.icon2}
                                        source={require("../../assets/image/intro/intro2.png")}
                                        resizeMode={"contain"}
                                    />
                                }
                            />
                        </View>
                        <View key={2}>
                            <IntroChildScreen
                                title={t("intro.title3")}
                                subtitle={t("intro.subtitle3")}
                                iconImage={
                                    <Image
                                        style={styles.icon3}
                                        source={require("../../assets/image/intro/intro3.png")}
                                        resizeMode={"contain"}
                                    />
                                }
                                showLoginButton={true}
                                onPressLogin={onPressLogin}
                            />
                        </View>
                    </ViewPager>
                    <PageIndicator
                        ref={pageIndicatorRef}
                        numberOfPages={3}
                        pageIndicatorTintColor={Colors.cathyMajorText}
                        currentPageIndicatorTintColor={Colors.cathyOrange}
                        indicatorRadius={5}
                        onIndicatorPress={onIndicatorPress}
                    />
                </LinearGradient>
            </SafeAreaFix>
        );
    })
);

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

export { IntroScreen };
