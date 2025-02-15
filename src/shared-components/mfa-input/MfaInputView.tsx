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
import React, { PureComponent } from 'react';
import {
    View,
    StyleProp,
    ViewStyle,
    StyleSheet,
} from 'react-native';
import { MfaChildView } from './MfaChildView';

interface Props {
    style: StyleProp<ViewStyle>;
    onChangeCode: (code: string) => void;
}

export class MfaInputView extends PureComponent<Props> {

    static defaultProps = {
        style: undefined
    };

    private childViews: MfaChildView[];
    private codes: string[];
    private indices: number[];

    constructor(props: Props) {
        super(props);
        this.childViews = [];
        this.codes = [];
        this.indices = [];
        for (let i = 0; i < 6; i++) {
            this.codes.push('');
            this.indices.push(i);
        }
    }

    clear(): void {
        for (let i = 0; i < 6; i++) {
            this.childViews[i].clear();
            this.codes[i] = '';
        }
    }

    private onChildChangeText(text: string, index: number): void {
        if (text.length === 6 && index === 0) {
            this.onPasteOTP(text);
            return;
        }
        this.codes[index] = text;
        if (text.length === 0 && index > 0) {
            this.childViews[index - 1].focus();
        }
        if (text.length === 1 && index < 5) {
            this.childViews[index + 1].focus();
        }
        this.props.onChangeCode(this.codes.join(''));
    }

    private onChildKeyPress(key: string, index: number): void {
        if (key === 'Backspace' && this.codes[index].length === 0 && index > 0) {
            this.childViews[index - 1].focus();
        }
    }

    private onPasteOTP(otp: string): void {
        for (let i = 0; i < this.codes.length; i++) {
            const text = otp.charAt(i);
            this.codes[i] = text;
            if (i === 0) {
                continue;
            }
            this.childViews[i].text = text;
        }
        this.childViews[5].focus();
        this.props.onChangeCode(this.codes.join(''));
    }

    render() {
        return (
            <View style={[styles.mfaInputView, this.props.style]}>
                {this.indices.map((i) => (
                    <MfaChildView
                        key={i}
                        ref={(childView) => {
                            this.childViews[i] = childView!;
                        }}
                        isFirstChild={i === 0}
                        onChangeText={(text) => {
                            this.onChildChangeText(text, i);
                        }}
                        onKeyPress={(key) => {
                            this.onChildKeyPress(key, i);
                        }} />
                ))}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    mfaInputView: {
        height: 60,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
});
