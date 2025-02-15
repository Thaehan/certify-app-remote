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
import React, { FC, Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import { cathyViews } from "../../../shared-components/cathy/CommonViews";
import { TextFix } from "../../../shared-components/cathy/IOSFix";

interface Props {
    navigation: any;
}

/**
 * 'Success' step of forgot-password flow
 *
 * @author Lingqi
 */
const ForgotSuccessScreen: FC<Props> = ({ navigation }) => {
    const COUNT_MAX = 3;
    const [countDown, setCountDown] = useState(COUNT_MAX);
    const { t } = useTranslation();

    useEffect(() => {
        const timerId = setInterval(() => {
            setCountDown((prevCount) => {
                if (prevCount === 1) {
                    navigation.navigate("Auth/Login");
                }
                return prevCount - 1;
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, []);

    return (
        <Fragment>
            <View style={styles.topSpace} />
            <Image
                style={styles.successImage}
                source={require("../../../assets/image/auth/success.png")}
                resizeMode={"contain"}
            />
            <View style={styles.middleSpace1} />
            <TextFix style={cathyViews.title}>
                {t("auth.forgot.success_title")}
            </TextFix>
            <TextFix style={[cathyViews.subtitle, styles.subtitle]}>
                {t("auth.forgot.success_info", { count: countDown })}
            </TextFix>
            <View style={styles.bottomSpace} />
        </Fragment>
    );
};

const screenHeight = Dimensions.get("screen").height;
const styles = StyleSheet.create({
    topSpace: {
        height: (100 * (screenHeight - 182)) / 549,
    },
    successImage: {
        alignSelf: "center",
        width: 83,
        height: 102,
    },
    middleSpace1: {
        height: (28 * (screenHeight - 182)) / 549,
        minHeight: 16,
    },
    subtitle: {
        marginTop: 8,
    },
    bottomSpace: {
        flex: 1, // 421
    },
});

export { ForgotSuccessScreen };
