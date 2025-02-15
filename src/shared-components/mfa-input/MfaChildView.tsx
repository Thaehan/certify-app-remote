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
import React, { PureComponent } from "react";
import {
    View,
    TextInput,
    NativeSyntheticEvent,
    TextInputChangeEventData,
    TextInputKeyPressEventData,
    Dimensions,
    StyleSheet,
    Platform,
} from "react-native";
import { Colors } from "../../utils/Colors";

interface Props {
    isFirstChild: boolean;
    onChangeText: (text: string) => void;
    onKeyPress: (key: string) => void;
}

interface State {
    text: string;
    isInputFocused: boolean;
}

export class MfaChildView extends PureComponent<Props, State> {
    private textInput!: TextInput;

    constructor(props: Props) {
        super(props);
        this.state = {
            text: "",
            isInputFocused: false,
        };
        this.onChange = this.onChange.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);
    }

    set text(text: string) {
        if (text.length <= 1) {
            this.setState({ text });
        } else {
            this.setState({ text: text.charAt(0) });
        }
    }
    get text(): string {
        return this.state.text;
    }

    get isInputFocused(): boolean {
        return this.state.isInputFocused;
    }

    focus(): void {
        this.textInput.focus();
    }

    clear(): void {
        this.text = "";
    }

    private onChange(
        event: NativeSyntheticEvent<TextInputChangeEventData>
    ): void {
        const text = event.nativeEvent.text;
        this.text = text;
        if (!this.props.isFirstChild || text.length <= 1 || text.length === 6) {
            this.props.onChangeText(text);
        } else {
            this.props.onChangeText(text.charAt(0));
        }
    }

    private onKeyPress(
        event: NativeSyntheticEvent<TextInputKeyPressEventData>
    ): void {
        this.props.onKeyPress(event.nativeEvent.key);
    }
    handleFocus = () => {
        this.setState({ isInputFocused: true });
    };

    handleBlur = () => {
        this.setState({ isInputFocused: false });
    };

    render() {
        const { isFirstChild } = this.props;
        return (
            <View
                style={[
                    styles.mfaChildContainer,
                    this.isInputFocused ? styles.active : undefined,
                    this.text ? styles.haveText : undefined,
                ]}
            >
                <TextInput
                    ref={(input) => (this.textInput = input!)}
                    style={styles.mfaTextInput}
                    keyboardType={"numeric"}
                    returnKeyType={"done"}
                    value={this.text}
                    maxLength={isFirstChild ? 6 : 1}
                    autoFocus={isFirstChild}
                    underlineColorAndroid={"transparent"}
                    selectTextOnFocus={true}
                    onChange={this.onChange}
                    onKeyPress={this.onKeyPress}
                    onFocus={this.handleFocus}
                    onBlur={this.handleBlur}
                />
                {!this.text && !this.isInputFocused && (
                    <View style={styles.mfaChildLine} />
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    mfaChildContainer: {
        width: Dimensions.get("window").width > 400 ? 52 : 48,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: "transparent",
        // borderColor: Colors.cathyBlueBorder,
        backgroundColor: "rgba(240, 240, 240, 1)",
    },
    mfaTextInput: {
        flex: 1,
        paddingTop:
            Platform.OS === "android" && Platform.Version === 21
                ? 12
                : undefined,
        fontSize: 24,
        fontFamily: "Roboto-Regular",
        textAlign: "center",
        color: Colors.cathyMajorText,
    },
    mfaChildLine: {
        position: "absolute",
        top: "50%", // Position the line in the center vertically
        width: "20%", // Set the width of the line to 10% of the container's width
        alignSelf: "center", // Center the line horizontally
        height: 2, // Adjust the height of the line as needed
        backgroundColor: "rgba(0, 0, 0, 0.3)", // Adjust the color of the line as needed
    },
    active: {
        backgroundColor: "white",
        borderColor: Colors.cathyBlueBorder,
    },
    haveText: {
        backgroundColor: "white",
    },
});
1