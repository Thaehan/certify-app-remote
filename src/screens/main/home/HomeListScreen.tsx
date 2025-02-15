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

interface Props {
    callbackStore: CallbackStore;
    appListStore: AppListStore;
}

interface ItemProps {
    app?: MobileApp;
    onPress: () => void;
}

/**
 * List layout of mobile app list
 *
 * @author Lingqi
 */
const HomeListScreen: FC<Props> = inject(({ rootStore }: AllStores) => ({
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
            <HomeListItem app={item} onPress={() => onItemPress(position)} />
        );

        return (
            <GridList
                style={styles.listView}
                rowHeight={88}
                dataSet={appListStore.appList}
                renderItem={renderItem}
            />
        );
    })
);

/**
 * An item within the mobile app list layout
 *
 * @author Lingqi
 */
const HomeListItem: FC<ItemProps> = ({ app, onPress }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <MaterialButton
            style={styles.listItem}
            contentStyle={styles.listItemContent}
            rippleColor={Colors.blackOverlay}
            onPress={onPress}
        >
            <View style={styles.listIconContainer}>
                {!imageLoaded && (
                    <Image
                        style={styles.placeholderImage}
                        source={require("../../../assets/image/placeholder.png")}
                        resizeMode={"cover"}
                    />
                )}
                {app && app.icon && (
                    <FastImage
                        style={styles.listItemIcon}
                        source={{ uri: app.icon }}
                        resizeMode={"contain"}
                        onLoad={() => setImageLoaded(true)}
                    />
                )}
            </View>
            <View style={styles.listTextContainer}>
                <Text style={styles.listItemTitle}>{app && app.title}</Text>
                <Text style={styles.listItemCaption} numberOfLines={2}>
                    {app && app.desc}
                </Text>
            </View>
            <View style={styles.listItemDivider} />
        </MaterialButton>
    );
};

const styles = StyleSheet.create({
    listView: {
        flex: 1,
        backgroundColor: "whitesmoke",
        paddingVertical: 8,
    },
    listItem: {
        height: 88,
    },
    listItemContent: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    listIconContainer: {
        marginTop: 16,
        marginHorizontal: 16,
        width: 40,
        height: 40,
        borderRadius: 4,
        backgroundColor: "white",
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
    listItemIcon: {
        width: 40,
        height: 40,
        borderRadius: 4,
    },
    listTextContainer: {
        flex: 1,
        marginRight: 16,
    },
    listItemTitle: {
        marginTop: 10,
        fontSize: 16,
        fontFamily: "Roboto-Regular",
        letterSpacing: 0.5,
        lineHeight: 24,
        color: Colors.majorText,
    },
    listItemCaption: {
        height: 40,
        fontSize: 14,
        fontFamily: "Roboto-Regular",
        lineHeight: 20,
        color: Colors.helperText,
    },
    listItemDivider: {
        position: "absolute",
        right: 16,
        bottom: 0,
        left: 72,
        height: 1,
        backgroundColor: Colors.darkDivider,
    },
    placeholderImage: {
        position: "absolute",
        width: 40,
        height: 40,
        borderRadius: 16,
    },
});

export { HomeListScreen };
