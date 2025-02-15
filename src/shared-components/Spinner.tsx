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
    Modal,
    View,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { Colors } from '../utils/Colors';

interface Props {
    isVisible: boolean;
}

export class Spinner extends PureComponent<Props> {
    render() {
        return (
            <Modal
                animationType={'fade'}
                transparent={true}
                hardwareAccelerated={true}
                visible={this.props.isVisible}
                onRequestClose={() => { }}>
                <View style={styles.spinnerBackground}>
                    <View style={styles.spinnerContainer}>
                        <ActivityIndicator
                            size={'large'}
                            color={'white'} />
                    </View>
                </View>
            </Modal>
        );
    }
}

export class WebSpinner extends PureComponent {
    render() {
        return (
            <View style={styles.webIndicatorContainer}>
                <ActivityIndicator
                    size={'large'}
                    color={Colors.matPurple} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    spinnerBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinnerContainer: {
        width: 280,
        height: 156,
        borderRadius: 16,
        backgroundColor: Colors.helperText,
        alignItems: 'center',
        justifyContent: 'center',
    },
    webIndicatorContainer: {
        position: 'absolute',
        top: 0,
        right: 100,
        left: 100,
        height: 60,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
