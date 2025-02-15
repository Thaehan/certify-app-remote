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
    Component,
    PureComponent,
    ReactElement,
} from 'react';
import {
    View,
    Image,
    Text,
    Linking,
    Alert,
    StyleSheet,
    Platform,
} from 'react-native';
import { inject, observer } from 'mobx-react';
import FastImage from 'react-native-fast-image';
import { GridList, ListItemInfo } from '../../../nativeUtils/GridList';
import { I18n } from '../../../utils/I18n';
import { Colors } from '../../../utils/Colors';
import { AllStores } from '../../../stores/RootStore';
import { CallbackStore } from '../../../stores/CallbackStore';
import { AppListStore, MobileApp } from '../../../stores/AppListStore';
import { MaterialButton } from '../../../shared-components/MaterialButton';

interface Props {
    callbackStore: CallbackStore;
    appListStore: AppListStore;
}

/**
 * List layout of mobile app list
 *
 * @author Lingqi
 */
@inject(({ rootStore }: AllStores) => ({
    callbackStore: rootStore.callbackStore,
    appListStore: rootStore.appListStore,
}))
@observer
export class HomeListScreen extends Component<Props> {

    static defaultProps = {
        callbackStore: undefined,
        appListStore: undefined,
    };

    constructor(props: Props) {
        super(props);
        this.renderItem = this.renderItem.bind(this);
        this.onItemPress = this.onItemPress.bind(this);
    }

    private renderItem({ item, position }: ListItemInfo<MobileApp>): ReactElement {
        return (
            <HomeListItem
                app={item}
                onPress={() => {
                    this.onItemPress(position);
                }} />
        );
    }

    private onItemPress(index: number): void {
        const { appListStore, callbackStore } = this.props;
        const selectedApp = appListStore.appList[index];
        callbackStore.selectedApp = selectedApp;
        const redirectUrl = callbackStore.getAppStartLink();
        Linking.openURL(redirectUrl)
            .then()
            .catch(() => {
                this.downloadApp(selectedApp);
            });
    }

    //**************************************************************
    // Other Methods
    //****************************************************************

    private downloadApp(app: MobileApp): void {
        const downloadUrl = Platform.OS === 'android' ? app.downloads.android : app.downloads.iOS;
        if (downloadUrl) {
            Alert.alert(
                I18n.t('alert.title.install'),
                I18n.t('alert.not_installed', {appName: app.title}),
                [
                    {
                        text: I18n.t('alert.button.cancel'),
                        onPress: () => {
                        }
                    },
                    {
                        text: I18n.t('alert.button.ok'),
                        onPress: () => {
                            Linking.openURL(downloadUrl)
                                .then()
                                .catch();
                        }
                    }
                ],
                {cancelable: false}
            );
        } else {
            Alert.alert(
                I18n.t('alert.title.error'),
                I18n.t('error.not_installed', {appName: app.title}),
                [{text: I18n.t('alert.button.ok'), style: 'cancel'}],
                {cancelable: false},
            );
        }
    }

    //**************************************************************
    // Render
    //****************************************************************

    render() {
        const { appListStore } = this.props;
        return (
            <GridList
                style={styles.listView}
                rowHeight={88}
                dataSet={appListStore.appList}
                renderItem={this.renderItem} />
        );
    }
}

interface ItemProps {
    app?: MobileApp;
    onPress: () => void;
}
interface ItemState {
    imageLoaded: boolean;
}

/**
 * An item within the mobile app list layout
 *
 * @author Lingqi
 */
class HomeListItem extends PureComponent<ItemProps, ItemState> {
    constructor(props: ItemProps) {
        super(props);
        this.state = {
            imageLoaded: false
        };
    }
    render() {
        const { app } = this.props;
        const { imageLoaded } = this.state;
        return (
            <MaterialButton
                style={styles.listItem}
                contentStyle={styles.listItemContent}
                rippleColor={Colors.blackOverlay}
                onPress={this.props.onPress}>
                <View style={styles.listIconContainer}>
                    {!imageLoaded && (
                        <Image
                            style={styles.placeholderImage}
                            source={require('../../../assets/image/placeholder.png')}
                            resizeMode={'cover'} />
                    )}
                    {app && app.icon && (
                        <FastImage
                            style={styles.listItemIcon}
                            source={{ uri: app.icon }}
                            resizeMode={'contain'}
                            onLoad={() => {
                                this.setState({ imageLoaded: true });
                            }} />
                    )}
                </View>
                <View style={styles.listTextContainer}>
                    <Text style={styles.listItemTitle}>
                        {app && app.title}
                    </Text>
                    <Text
                        style={styles.listItemCaption}
                        numberOfLines={2}>
                        {app && app.desc}
                    </Text>
                </View>
                <View style={styles.listItemDivider} />
            </MaterialButton>
        );
    }
}

const styles = StyleSheet.create({
    listView: {
        flex: 1,
        backgroundColor: 'whitesmoke',
        paddingVertical: 8,
    },
    listItem: {
        height: 88,
    },
    listItemContent: {
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    listIconContainer: {
        marginTop: 16,
        marginHorizontal: 16,
        width: 40,
        height: 40,
        borderRadius: 4,
        backgroundColor: 'white',
        ...Platform.select({
            android: {
                elevation: 1,
                borderWidth: Platform.Version < 21 ? 1 : undefined,
                borderColor: Platform.Version < 21 ? Colors.darkDivider : undefined
            },
            ios: {
                shadowColor: 'black',
                shadowOpacity: 0.24,
                shadowRadius: 0.75,
                shadowOffset: {
                    width: 0,
                    height: 0.5,
                },
            }
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
        fontFamily: 'Roboto-Regular',
        letterSpacing: 0.5,
        lineHeight: 24,
        color: Colors.majorText
    },
    listItemCaption: {
        height: 40,
        fontSize: 14,
        fontFamily: 'Roboto-Regular',
        lineHeight: 20,
        color: Colors.helperText,
    },
    listItemDivider: {
        position: 'absolute',
        right: 16,
        bottom: 0,
        left: 72,
        height: 1,
        backgroundColor: Colors.darkDivider
    },
    placeholderImage: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 16,
    },
});
