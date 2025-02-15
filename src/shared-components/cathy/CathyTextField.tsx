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
    ReactElement,
    ReactNode,
    ClassAttributes,
} from 'react';
import {
    View,
    Image,
    TextInput,
    TextInputProps,
    StyleProp,
    ViewStyle,
    ImageSourcePropType,
    StyleSheet,
    Platform,
} from 'react-native';
import { CathyIconButton } from './CathyButton';
import { Colors } from '../../utils/Colors';

interface Props {
    style: StyleProp<ViewStyle>;
    iconSource: ImageSourcePropType;
    password: boolean;
    children?: React.ReactNode; // Add this line
}
interface State {
    passwordVisible: boolean;
}

/**
 * Component let users enter and edit text
 *
 * @author Lingqi
 */
export class CathyTextField extends PureComponent<Props, State> {

    static defaultProps = {
        style: undefined,
        password: false
    };

    private textInput!: TextInput;

    constructor(props: Props) {
        super(props);
        this.state = {
            passwordVisible: false
        };
        this.onPressVisibility = this.onPressVisibility.bind(this);
    }

    private onPressVisibility(): void {
        this.setState({
            passwordVisible: !this.state.passwordVisible
        });
        if (Platform.OS === 'ios' && this.textInput.isFocused()) {
            this.textInput.blur();
            setTimeout(() => {
                this.textInput.focus();
            }, 100);
        }
    }

    private validateChildren(): ReactNode {
        const child = React.Children.only(this.props.children);
        if ((child as any).type !== TextInput) {
            throw new Error('Children must be TextInput');
        }
        return child;
    }

    private configTextInput(child: ReactElement): ReactElement {
        const textInputProps: TextInputProps & ClassAttributes<TextInput> = {
            ref: (textInput) => {
                this.textInput = textInput!;
                const { ref } = child as any;
                if (typeof ref === 'function') {
                    ref(textInput);
                }
            },
            style: [styles.textInput, this.props.password && styles.passwordInput],
            secureTextEntry: this.props.password ? !this.state.passwordVisible : false,
            placeholderTextColor: Colors.cathyPlaceholder,
            underlineColorAndroid: 'transparent',
            autoCorrect: false,
        };
        return React.cloneElement(child, textInputProps);
    }

    render() {
        let child = this.validateChildren();
        child = this.configTextInput(child as ReactElement);
        return (
            <View style={[styles.textField, this.props.style]}>
                <Image
                    style={styles.textFieldIcon}
                    source={this.props.iconSource} />
                {child}
                {this.props.password && (
                    <CathyIconButton
                        style={styles.textFieldVisibility}
                        iconSource={this.state.passwordVisible ?
                            require('../../assets/image/icon/visible.png') :
                            require('../../assets/image/icon/visible_off.png')}
                        tintColor={Colors.unfocusedIcon}
                        onPress={this.onPressVisibility} />
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    textField: {
        height: 56,
        marginHorizontal: 24,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: Colors.cathyBlueBorder,
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
    },
    textFieldIcon: {
        marginLeft: 12,
        width: 24,
        height: 24,
        tintColor: Colors.cathyOrange,
    },
    textFieldVisibility: {
        marginRight: 4
    },
    textInput: {
        flex: 1,
        alignSelf: 'stretch',
        paddingTop: Platform.OS === 'android' && Platform.Version === 21 ? 12 : undefined,
        paddingRight: 12,
        paddingLeft: 8,
        fontSize: 16,
        fontFamily: 'Roboto-Regular',
        letterSpacing: 0.5,
        color: Colors.cathyMajorText,
    },
    passwordInput: {
        paddingRight: 0
    },
});
