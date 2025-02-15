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
    Fragment,
    ReactNode,
} from 'react';
import {
    SafeAreaView,
    Text,
    TextProps,
    TextStyle,
    View,
    ViewStyle,
    StyleSheet,
    Platform,
} from 'react-native';

interface SafeAreaProps {
    children: React.ReactNode
    statusBarColor: string;
    containerColor: string;
}
/**
 * Fix when iOS status bar and home indicator have different background color
 *
 * @author Lingqi
 */
export class SafeAreaFix extends PureComponent<SafeAreaProps> {
    render() {
        return Platform.select({
            android: (
                <Fragment>
                    {this.props.children}
                </Fragment>
            ),
            ios: (
                this.renderIOS()
            )
        });
    }
    private renderIOS(): ReactNode {
        const { statusBarColor, containerColor } = this.props;
        return (
            <Fragment>
                <SafeAreaView
                    style={[styles.statusBar, { backgroundColor: statusBarColor }]} />
                <SafeAreaView
                    style={[styles.container, { backgroundColor: containerColor }]}>
                    {this.props.children}
                </SafeAreaView>
            </Fragment>
        );
    }
}

/**
 * @summary Fix when iOS text display inside KeyboardAvoidingView
 * @description Need to split style into array of two elements, the first is TextStyle, the second is ViewStyle
 *
 * @author Lingqi
 */
export class TextFix extends PureComponent<TextProps> {
    render() {
        return Platform.select({
            android: (
                <Text {...this.props} />
            ),
            ios: (
                this.renderIOS()
            ),
        });
    }
    private renderIOS(): ReactNode {
        const { style, ...props } = this.props;
        let textStyle: TextStyle;
        let viewStyle: ViewStyle;
        if (Array.isArray(style)) {
            textStyle = style[0] as TextStyle;
            viewStyle = style[1] as ViewStyle;
        } else {
            textStyle = style as TextStyle;
            viewStyle = {};
        }
        if (!viewStyle.height) {
            viewStyle.height = textStyle.height || textStyle.lineHeight;
        }
        return (
            <View style={viewStyle}>
                <Text style={textStyle} {...props} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    statusBar: {
        flex: 0,
    },
    container: {
        flex: 1,
    },
});
