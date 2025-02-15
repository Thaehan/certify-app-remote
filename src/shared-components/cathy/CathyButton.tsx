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
    Text,
    Image,
    Animated,
    Platform,
    StyleProp,
    ViewStyle,
    ImageSourcePropType,
    StyleSheet,
} from 'react-native';
import { MaterialButton } from '../MaterialButton';
import { Colors } from '../../utils/Colors';

interface TextButtonProps {
    style?: StyleProp<ViewStyle>;
    text: string;
    onPress: () => void;
}
/**
 * Component of text button
 *
 * @author Lingqi
 */
export class CathyTextButton extends PureComponent<TextButtonProps> {
    render() {
        return (
            <MaterialButton
                style={[styles.textButton , this.props.style]}
                contentStyle={styles.textButtonContent}
                rippleColor={Colors.blackOverlay}
                onPress={this.props.onPress}>
                <Text style={styles.textButtonText}>
                    {this.props.text}
                </Text>
            </MaterialButton>
        );
    }
}

interface IconButtonProps {
    style?: StyleProp<ViewStyle>;
    iconSource: ImageSourcePropType;
    tintColor: string;
    onPress: () => void;
}
/**
 * Component of icon button
 *
 * @author Lingqi
 */
export class CathyIconButton extends PureComponent<IconButtonProps> {
    render() {
        const { tintColor } = this.props;
        const isWhite = tintColor === 'white' || tintColor === '#FFFFFF';
        return (
            <MaterialButton
                style={[styles.iconButton, this.props.style]}
                contentStyle={styles.iconButtonContent}
                rippleColor={isWhite ? Colors.whiteOverlay : Colors.blackOverlay}
                onPress={this.props.onPress}>
                <Image
                    style={[styles.iconButtonIcon, { tintColor }]}
                    source={this.props.iconSource}
                    resizeMode={'contain'} />
            </MaterialButton>
        );
    }
}

interface RaisedButtonProps {
    style?: StyleProp<ViewStyle>;
    text: string;
    disabled?: boolean
    onPress: () => void;
}
interface RaisedButtonState {
    elevation: Animated.Value;
}
/**
 * Component of raised button
 *
 * @author Lingqi
 */
export class CathyRaisedButton extends PureComponent<RaisedButtonProps, RaisedButtonState> {

    constructor(props: RaisedButtonProps) {
        super(props);
        this.state = {
            elevation: new Animated.Value(2)
        };
        this.onPressIn = this.onPressIn.bind(this);
        this.onPressOut = this.onPressOut.bind(this);
    }

    private onPressIn(): void {
        Animated.timing(this.state.elevation, {
            toValue: 8,
            duration: 200,
            useNativeDriver: Platform.OS === 'android',
        }).start();
    }

    private onPressOut(): void {
        Animated.timing(this.state.elevation, {
            toValue: 2,
            duration: 150,
            useNativeDriver: Platform.OS === 'android',
        }).start();
    }

    render() {
        const { elevation } = this.state;
        return (
            <MaterialButton
                style={[
                    this.props.disabled ? styles.raisedButtonDisabled : styles.raisedButton,
                    this.props.style,
                    Platform.select({
                        android: {
                            elevation,
                            borderWidth: Platform.Version < 21 ? 1 : undefined,
                            borderColor: Platform.Version < 21 ? Colors.darkDivider : undefined
                        },
                        ios: {
                            shadowColor: 'black',
                            shadowOpacity: 0.24,
                            shadowRadius: elevation.interpolate({
                                inputRange: [2, 3, 8],
                                outputRange: [1.5, 3, 8]
                            }),
                            shadowOffset: {
                                width: new Animated.Value(0),
                                height: elevation.interpolate({
                                    inputRange: [2, 3, 8],
                                    outputRange: [0.75, 2, 7]
                                }),
                            },
                        }
                    }) as any
                ]}
                disabled={this.props.disabled}
                rippleColor={Colors.whiteOverlay}
                animated={true}
                onPressIn={this.onPressIn}
                onPressOut={this.onPressOut}
                onPress={this.props.onPress}>
                <Text style={styles.raisedButtonText}>
                    {this.props.text}
                </Text>
            </MaterialButton>
        );
    }
}

const styles = StyleSheet.create({

    /* Text Button Styles */
    textButton : {
        alignSelf: 'center',
        height: 36,
        borderRadius: 4,
    },
    textButtonContent: {
        paddingHorizontal: 16,
    },
    textButtonText: {
        fontSize: 14,
        fontFamily: 'Roboto-Medium',
        lineHeight: 36,
        color: Colors.cathyBlue,
    },

    /* Icon Button Styles */
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    iconButtonContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconButtonIcon: {
        width: 24,
        height: 24,
    },

    /* Raised Button Styles */
    raisedButton: {
        height: 48,
        marginHorizontal: 24,
        zIndex: 1,
        backgroundColor: Colors.cathyOrange,
        borderRadius: 4,
    },
    raisedButtonText: {
        fontSize: 15,
        fontWeight: 'bold',
        fontFamily: 'Roboto-Bold',
        textTransform: 'uppercase',
        letterSpacing: 1.25,
        lineHeight: 48,
        textAlign: 'center',
        color: 'white',
    },
    raisedButtonDisabled: {
        height: 48,
        marginHorizontal: 24,
        zIndex: 1,
        backgroundColor: Colors.cathyGrey,
        borderRadius: 4,
    },
});
