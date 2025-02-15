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
import React, {
    PureComponent,
    Fragment
} from 'react';
import {
    StatusBar,
    StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


import { inject } from 'mobx-react';
import {
    NavigationScreenProp,
    NavigationRoute,
    NavigationScreenConfig,
    NavigationStackScreenOptions,
} from 'react-navigation';
import { Colors } from '../../../utils/Colors';
import { Keys } from '../../../utils/Constants';
import { AllStores } from '../../../stores/RootStore';
import { AppListStore } from '../../../stores/AppListStore';
import { HomeGridScreen } from './HomeGridScreen';
import { HomeListScreen } from './HomeListScreen';
import { CathyIconButton } from '../../../shared-components/cathy/CathyButton';

interface Props {
    navigation: NavigationScreenProp<NavigationRoute>;
    appListStore: AppListStore;
}
interface State {
    appListLayout: AppListLayout;
}
type AppListLayout = 'grid' | 'list';

/**
 * Component display mobile app list, contains 2 layouts
 *
 * @author Lingqi
 */
@inject(({ rootStore }: AllStores) => ({
    appListStore: rootStore.appListStore,
}))
export class HomeScreen extends PureComponent<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            appListLayout: 'grid'
        };
        this.onPressLayout = this.onPressLayout.bind(this);
        props.navigation.setParams({
            appListLayout: 'grid',
            onPressLayout: this.onPressLayout,
        });
        AsyncStorage.getItem(Keys.APP_LAYOUT).then((appListLayout) => {
            if (appListLayout) {
                this.appListLayout = appListLayout as any;
            }
        });
    }

    private set appListLayout(layout: AppListLayout) {
        this.setState({ appListLayout: layout });
        this.props.navigation.setParams({ appListLayout: layout });
    }
    private get appListLayout(): AppListLayout {
        return this.state.appListLayout;
    }

    //**************************************************************
    // Screen Header
    //****************************************************************

    static navigationOptions: NavigationScreenConfig<NavigationStackScreenOptions> = ({ navigation }) => {
        const layout: AppListLayout = navigation.getParam('appListLayout', 'grid');
        let layoutIcon;
        switch (layout) {
            case 'grid':
                layoutIcon = require('../../../assets/image/icon/view_module.png');
                break;
            case 'list':
                layoutIcon = require('../../../assets/image/icon/view_list.png');
                break;
        }
        return {
            title: 'Certify',
            headerTitleAllowFontScaling: false,
            headerTintColor: 'white',
            headerStyle: {
                backgroundColor: Colors.cathyBlue
            },
            headerRight: (
                <CathyIconButton
                    style={styles.layoutButton}
                    iconSource={layoutIcon}
                    tintColor={'white'}
                    onPress={navigation.getParam('onPressLayout')} />
            )
        };
    }

    //**************************************************************
    // Component Lifecycle
    //****************************************************************

    componentDidMount() {
        const { appListStore } = this.props;
        if (appListStore.appList.length === 0) {
            appListStore.fetchAppList()
                .then()
                .catch((reason) => {
                    console.log(reason);
                });
        }
    }

    //**************************************************************
    // Button Callbacks
    //****************************************************************

    private onPressLayout(): void {
        switch (this.appListLayout) {
            case 'grid':
                this.appListLayout = 'list';
                AsyncStorage.setItem(Keys.APP_LAYOUT, 'list');
                break;
            case 'list':
                this.appListLayout = 'grid';
                AsyncStorage.setItem(Keys.APP_LAYOUT, 'grid');
                break;
        }
    }

    //**************************************************************
    // Render
    //****************************************************************

    render() {
        let homeChildScreen;
        switch (this.appListLayout) {
            case 'grid':
                homeChildScreen = <HomeGridScreen />;
                break;
            case 'list':
                homeChildScreen = <HomeListScreen />;
                break;
        }
        return (
            <Fragment>
                <StatusBar
                    barStyle={'light-content'}
                    backgroundColor={Colors.cathyBlueDark} />
                {homeChildScreen}
            </Fragment>
        );
    }
}

const styles = StyleSheet.create({
    layoutButton: {
        marginRight: 8,
    },
});
