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
    Image,
    View,
    Text,
    StyleSheet
} from 'react-native';
import {
    NavigationStackScreenOptions,
    NavigationScreenConfig
} from 'react-navigation';
import { I18n } from '../../../utils/I18n';
import { AppVersion } from "../../../utils/Constants";

export class ProfileAboutScreen extends PureComponent {

    static navigationOptions: NavigationScreenConfig<NavigationStackScreenOptions> = ({ navigation }) => {
        return {
            title: I18n.t('profile.item.about'),
        };
    }

    //**************************************************************
    // Render
    //****************************************************************

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.aboutIconContainer}>
                    <Image
                        style={styles.aboutIcon}
                        source={require('../../../assets/image/AppIcon-nobg.png')}
                        resizeMode={'cover'} />
                </View>
                <View style={styles.aboutVersionContainer}>
                    <Text style={styles.aboutVersion}>
                        {I18n.t("about.version")} {' : '} {AppVersion.version}</Text>
                    <Text style={styles.aboutBuild}>
                        {I18n.t("about.build")} {' : '} {AppVersion.build}</Text>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'whitesmoke',
    },
    aboutIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
        marginBottom: 30
    },
    aboutIcon: {
        height: 250,
        width: 250
    },
    aboutVersionContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        margin: 10
    },
    aboutVersion: {
        fontSize: 20,
        fontFamily: 'Roboto-Regular',
        margin: 5
    },
    aboutBuild: {
        fontSize: 20,
        fontFamily: 'Roboto-Regular',
        margin: 5
    }
});
