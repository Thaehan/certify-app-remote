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
import { inject, observer } from "mobx-react";
import React, { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Alert,
    Dimensions,
    Image,
    Linking,
    Platform,
    StyleSheet,
    Text,
    View,
} from "react-native";
import FastImage from "react-native-fast-image";
import { GridList, ListItemInfo } from "../../../nativeUtils/GridList";
import { MaterialButton } from "../../../shared-components/MaterialButton";
import { AppListStore, MobileApp } from "../../../stores/AppListStore";
import { CallbackStore } from "../../../stores/CallbackStore";
import { AllStores } from "../../../stores/RootStore";
import { Colors } from "../../../utils/Colors";

const COL_CALC_BASE = 135;
const ICON_WIDTH_MAX = 105;

const SCREEN_WIDTH = Dimensions.get("screen").width;
const COLS = Math.max(Math.floor(SCREEN_WIDTH / COL_CALC_BASE), 3);
const ICON_WIDTH = Math.min(
    (SCREEN_WIDTH - 12 * (COLS + 1)) / COLS,
    ICON_WIDTH_MAX
);
const H_SPACING = (SCREEN_WIDTH - ICON_WIDTH * COLS) / (COLS + 1);
const V_SPACING = 24;
const ROW_HEIGHT = ICON_WIDTH + 40;

interface Props {
    callbackStore: CallbackStore;
    appListStore: AppListStore;
}

/**
 * Grid layout of mobile app list
 *
 * @author Lingqi
 */
const HomeGridScreen: FC<Props> = inject(({ rootStore }: AllStores) => ({
    callbackStore: rootStore.callbackStore,
    appListStore: rootStore.appListStore,
}))(
    observer(({ callbackStore, appListStore }) => {
        const { t } = useTranslation();

        const downloadApp = (app: MobileApp): void => {
            const downloadUrl =
                Platform.OS === "android"
                    ? app.downloads.android
                    : app.downloads.iOS;
            if (downloadUrl) {
                Alert.alert(
                    t("alert.title.install"),
                    t("alert.not_installed", { appName: app.title }),
                    [
                        {
                            text: t("alert.button.cancel"),
                            onPress: () => {},
                        },
                        {
                            text: t("alert.button.ok"),
                            onPress: () => {
                                Linking.openURL(downloadUrl).then().catch();
                            },
                        },
                    ],
                    { cancelable: false }
                );
            } else {
                Alert.alert(
                    t("alert.title.error"),
                    t("error.not_installed", { appName: app.title }),
                    [{ text: t("alert.button.ok"), style: "cancel" }],
                    { cancelable: false }
                );
            }
        };

        const onItemPress = (index: number): void => {
            const selectedApp = appListStore.appList[index];
            callbackStore.selectedApp = selectedApp;
            const redirectUrl = callbackStore.getAppStartLink();
            Linking.openURL(redirectUrl)
                .then()
                .catch(() => {
                    downloadApp(selectedApp);
                });
        };

        const renderItem = ({ item, position }: ListItemInfo<MobileApp>) => (
            <HomeGridItem app={item} onPress={() => onItemPress(position)} />
        );

        return (
            <GridList
                style={styles.gridView}
                rowHeight={ROW_HEIGHT}
                numColumns={COLS}
                verticalSpacing={V_SPACING}
                horizontalSpacing={H_SPACING}
                clipItem={false}
                dataSet={appListStore.appList}
                renderItem={renderItem}
            />
        );
    })
);

interface ItemProps {
    app?: MobileApp;
    onPress: () => void;
}

/**
 * An item within the mobile app grid layout
 *
 * @author Lingqi
 */
const HomeGridItem: FC<ItemProps> = ({ app, onPress }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <View style={styles.gridItem}>
            <MaterialButton
                style={styles.gridItemButton}
                rippleColor={Colors.cathyBlueOverlay}
                onPress={onPress}
            >
                {!imageLoaded && (
                    <Image
                        style={styles.placeholderImage}
                        source={require("../../../assets/image/placeholder.png")}
                        resizeMode={"cover"}
                    />
                )}
                {app && app.icon && (
                    <FastImage
                        style={styles.gridItemIcon}
                        source={{ uri: app.icon }}
                        resizeMode={"contain"}
                        onLoad={() => setImageLoaded(true)}
                    />
                )}
                {app && app.appType === "WEB" && (
                    <View style={styles.webApp}>
                        <Text style={styles.webAppText}>{"WEB"}</Text>
                    </View>
                )}
            </MaterialButton>
            <Text
                style={styles.gridItemText}
                numberOfLines={2}
                adjustsFontSizeToFit={true}
            >
                {app && app.title}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    gridView: {
        flex: 1,
        backgroundColor: "whitesmoke",
        paddingVertical: V_SPACING,
        paddingHorizontal: H_SPACING,
    },
    gridItem: {
        width: ICON_WIDTH,
        height: ROW_HEIGHT,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
    },
    gridItemButton: {
        width: ICON_WIDTH,
        height: ICON_WIDTH,
        borderRadius: 16,
        backgroundColor: "white",
        zIndex: 1,
        ...Platform.select({
            android: {
                elevation: 1,
                borderWidth: Platform.Version < 21 ? 1 : undefined,
                borderColor:
                    Platform.Version < 21 ? Colors.darkDivider : undefined,
            },
            ios: {
                shadowColor: "black",
                shadowOpacity: 0.24,
                shadowRadius: 0.75,
                shadowOffset: {
                    width: 0,
                    height: 0.5,
                },
            },
        }),
    },
    gridItemIcon: {
        width: ICON_WIDTH,
        height: ICON_WIDTH,
        borderRadius: 16,
    },
    gridItemText: {
        marginTop: 8,
        fontSize: 14,
        fontFamily: "Roboto-Regular",
        lineHeight: 16,
        textAlign: "center",
        color: Colors.helperText,
        height: 32,
    },
    placeholderImage: {
        position: "absolute",
        width: ICON_WIDTH,
        height: ICON_WIDTH,
        borderRadius: 16,
    },
    webApp: {
        position: "absolute",
        right: 0,
        bottom: 0,
        left: 0,
        height: 27,
        backgroundColor: Colors.scrimColor,
    },
    webAppText: {
        fontSize: 15,
        fontFamily: "Roboto-Medium",
        textTransform: "uppercase",
        letterSpacing: 1.25,
        lineHeight: 27,
        textAlign: "center",
        color: "white",
    },
});

export { HomeGridScreen };
