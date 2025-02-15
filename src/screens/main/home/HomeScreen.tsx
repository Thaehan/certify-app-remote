import React, { Fragment, useEffect, useState } from "react";
import { StatusBar, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { inject, observer } from "mobx-react";
import { Colors } from "../../../utils/Colors";
import { Keys } from "../../../utils/Constants";
import { AllStores } from "../../../stores/RootStore";
import { AppListStore } from "../../../stores/AppListStore";
import { HomeGridScreen } from "./HomeGridScreen";
import { HomeListScreen } from "./HomeListScreen";
import { CathyIconButton } from "../../../shared-components/cathy/CathyButton";
import { useTranslation } from "react-i18next";
import { useNavigation, useRoute } from "@react-navigation/native";

interface Props {
    navigation: any;
    appListStore: AppListStore;
}

type AppListLayout = "grid" | "list";

const HomeScreen: React.FC<Props> = inject(({ rootStore }: AllStores) => ({
    appListStore: rootStore.appListStore,
}))(
    observer(({ appListStore }) => {
        const [appListLayout, setAppListLayout] =
            useState<AppListLayout>("grid");
        const { t } = useTranslation();
        const navigation = useNavigation();
        const route = useRoute();

        const updateAppListLayout = (layout: AppListLayout) => {
            setAppListLayout(layout);
            navigation.setParams({ appListLayout: layout });
        };

        const onPressLayout = (): void => {
            const newLayout = appListLayout === "grid" ? "list" : "grid";
            updateAppListLayout(newLayout);
            AsyncStorage.setItem(Keys.APP_LAYOUT, newLayout);
        };

        useEffect(() => {
            navigation.setParams({
                appListLayout: "grid",
                onPressLayout,
            });

            AsyncStorage.getItem(Keys.APP_LAYOUT).then((savedLayout) => {
                if (savedLayout) {
                    updateAppListLayout(savedLayout as AppListLayout);
                }
            });

            if (appListStore.appList.length === 0) {
                appListStore
                    .fetchAppList()
                    .then()
                    .catch((reason) => {
                        console.log(reason);
                    });
            }
        }, []);

        useEffect(() => {
            const layout: AppListLayout = route.params?.appListLayout ?? "grid";
            let layoutIcon;
            switch (layout) {
                case "grid":
                    layoutIcon = require("../../../assets/image/icon/view_module.png");
                    break;
                case "list":
                    layoutIcon = require("../../../assets/image/icon/view_list.png");
                    break;
            }

            navigation.setOptions({
                title: "Certify",
                headerTitleAllowFontScaling: false,
                headerTintColor: "white",
                headerStyle: {
                    backgroundColor: Colors.cathyBlue,
                },
                headerRight: () => (
                    <CathyIconButton
                        style={styles.layoutButton}
                        iconSource={layoutIcon}
                        tintColor={"white"}
                        onPress={route.params?.onPressLayout}
                    />
                ),
            });
        }, [navigation, route.params]);

        return (
            <Fragment>
                <StatusBar
                    barStyle={"light-content"}
                    backgroundColor={Colors.cathyBlueDark}
                />
                {appListLayout === "grid" ? (
                    <HomeGridScreen />
                ) : (
                    <HomeListScreen />
                )}
            </Fragment>
        );
    })
);

const styles = StyleSheet.create({
    layoutButton: {
        marginRight: 8,
    },
});

export { HomeScreen };
