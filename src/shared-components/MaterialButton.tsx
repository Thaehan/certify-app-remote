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
import React, {
    PureComponent,
    ReactNode,
} from 'react';
import {
    Platform,
    TouchableNativeFeedback,
    TouchableHighlight,
    Animated,
    View,
    StyleSheet,
    StyleProp,
    ViewStyle,
} from 'react-native';
import Color from 'color';

interface Props {
    style: StyleProp<ViewStyle>;
    contentStyle: StyleProp<ViewStyle>;
    rippleColor: string;
    disabled: boolean;
    animated: boolean;
    onPressIn: () => void;
    onPressOut: () => void;
    onPress: () => void;
    children : React.ReactNode
}

export class MaterialButton extends PureComponent<Props> {

    static defaultProps = {
        style: undefined,
        contentStyle: undefined,
        disabled: false,
        animated: false,
        onPressIn: undefined,
        onPressOut: undefined,
        onPress: () => { },
    };

    constructor(props: Props) {
        super(props);
    }

    render() {
        const { style } = this.props;
        return this.props.animated ? (
            <Animated.View style={[styles.button, style]}>
                {this.renderButton()}
            </Animated.View>
        ) : (
            <View style={[styles.button, style]}>
                {this.renderButton()}
            </View>
        );
    }

    private renderButton(): ReactNode {
        const { style, contentStyle, rippleColor } = this.props;
        const borderRadius = StyleSheet.flatten(style).borderRadius || 0;
        return Platform.OS === 'android' && Platform.Version >= 21 ? (
            <TouchableNativeFeedback
                background={TouchableNativeFeedback.Ripple(rippleColor, true)}
                useForeground={Platform.Version >= 23 ? true : undefined}
                disabled={this.props.disabled}
                onPressIn={this.props.onPressIn}
                onPressOut={this.props.onPressOut}
                onPress={this.props.onPress}>
                <View style={[contentStyle, styles.content, { borderRadius }]}>
                    {this.props.children}
                </View>
            </TouchableNativeFeedback>
        ) : (
            <TouchableHighlight
                style={[styles.iosTouchable, { borderRadius }]}
                activeOpacity={1}
                underlayColor={Color(rippleColor).fade(0.3).rgb().string()}
                disabled={this.props.disabled}
                onPress={this.props.onPress}
                onPressIn={this.props.onPressIn}
                onPressOut={this.props.onPressOut}>
                <View style={[contentStyle, styles.content, { borderRadius }]}>
                    {this.props.children}
                </View>
            </TouchableHighlight>
        );
    }
}

const styles = StyleSheet.create({
    button: {
        borderRadius: 0,
        ...Platform.select({
            android: {
                overflow: 'hidden',
            },
            ios: {
                overflow: 'visible',
            },
        })
    },
    content: {
        flex: 1,
        margin: 0,
        alignSelf: 'stretch',
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        overflow: 'hidden',
    },
    iosTouchable: {
        flex: 1,
    }
});
