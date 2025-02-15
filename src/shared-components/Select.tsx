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
    ReactText,
    Fragment,
} from 'react';
import {
    View,
    Text,
    Image,
    StyleProp,
    ViewStyle,
    TextStyle,
    TouchableWithoutFeedback,
    Modal,
    SafeAreaView,
    TouchableOpacity,
    Platform,
    StyleSheet,
} from 'react-native';
import {Picker, PickerItemProps} from '@react-native-picker/picker';

import { Colors } from '../utils/Colors';

interface Props {
    style: StyleProp<ViewStyle>;
    enabled: boolean;
    triggerValue: string;
    triggerTextStyle: StyleProp<TextStyle>;
    triggerArrowColor: string;
    selectedValue: ReactText;
    onValueChange: (itemValue: any, index: number) => void;
    children : ReactNode
}
interface StateIOS {
    isShowing: boolean;
    selectedValue?: ReactText;
    selectedIndex: number;
}

/**
 * Native selection component, Android widget.Spinner, iOS UIPickerView
 *
 * @author Lingqi
 */
export class Select extends PureComponent<Props, StateIOS> {

    static defaultProps = {
        style: undefined,
        enabled: true,
        triggerValue: undefined,
        triggerTextStyle: undefined,
        triggerArrowColor: Colors.unfocusedIcon,
        selectedValue: undefined,
        onValueChange: () => { }
    };
    static Item: typeof SelectItem;

    private labelValue: string;

    constructor(props: Props) {
        super(props);
        this.labelValue = '';
        if (Platform.OS === 'ios') {
            this.state = {
                isShowing: false,
                selectedValue: props.selectedValue,
                selectedIndex: -1,
            };
            this.onPressTriggerIOS = this.onPressTriggerIOS.bind(this);
            this.onPressCancelIOS = this.onPressCancelIOS.bind(this);
            this.onPressDoneIOS = this.onPressDoneIOS.bind(this);
            this.onPickerValueChangedIOS = this.onPickerValueChangedIOS.bind(this);
        }
    }

    componentDidUpdate(prevProps: Props, prevState: StateIOS) {
        if (Platform.OS === 'ios') {
            const { selectedValue } = this.props;
            if (selectedValue !== prevProps.selectedValue && this.state.selectedIndex !== -1) {
                this.setState({
                    selectedValue,
                    selectedIndex: -1
                });
            }
        }
    }

    private onPressTriggerIOS() {
        if (React.Children.count(this.props.children)) {
            this.setState({ isShowing: true });
        }
    }

    private onPressCancelIOS() {
        this.setState({ isShowing: false });
    }

    private onPressDoneIOS() {
        const { selectedValue, selectedIndex } = this.state;
        this.setState({ isShowing: false });
        if (selectedIndex !== -1) {
            this.props.onValueChange(selectedValue, selectedIndex);
            this.setState({ selectedIndex: -1 });
        }
    }

    private onPickerValueChangedIOS(itemValue: any, index: number) {
        this.setState({
            selectedValue: itemValue,
            selectedIndex: index,
        });
    }

    render() {
        return Platform.OS === 'android' ? this.renderAndroid() : this.renderIOS();
    }

    private renderAndroid(): ReactNode {
        const children = this.renderAndroidItem();
        return (
            <View style={[this.props.style, styles.selectTrigger]}>
                <Picker
                    style={styles.androidNativeSelect}
                    mode={'dropdown'}
                    enabled={this.props.enabled}
                    selectedValue={this.props.selectedValue}
                    onValueChange={this.props.onValueChange}>
                    {children}
                </Picker>
                <Text
                    style={[styles.triggerText, this.props.triggerTextStyle]}
                    numberOfLines={1}>
                    {this.props.triggerValue || this.labelValue}
                </Text>
                {/* <Image
                    style={[
                        styles.triggerArrow,
                        { tintColor: this.props.triggerArrowColor }]}
                    source={require('../assets/image/dropdown.png')}
                    resizeMode={'contain'} /> */}
            </View>
        );
    }

    private renderIOS(): ReactNode {
        const children = this.renderIOSItem();
        return (
            <Fragment>
                <TouchableWithoutFeedback
                    disabled={!this.props.enabled}
                    onPress={this.onPressTriggerIOS}>
                    <View style={[this.props.style, styles.selectTrigger]}>
                        <Text
                            style={[styles.triggerText, this.props.triggerTextStyle]}
                            numberOfLines={1}>
                            {this.props.triggerValue || this.labelValue}
                        </Text>
                        <Image
                            style={[
                                styles.triggerArrow,
                                { tintColor: this.props.triggerArrowColor }]}
                            source={require('../assets/image/dropdown.png')}
                            resizeMode={'contain'} />
                    </View>
                </TouchableWithoutFeedback>
                <Modal
                    animationType={'fade'}
                    transparent={true}
                    visible={this.state.isShowing}
                    onRequestClose={() => { }}>
                    <View style={styles.iOSPickerContainer}>
                        <View style={styles.iOSTopSpace} />
                        <SafeAreaView style={styles.iOSSafeArea}>
                            <View style={styles.iOSDoneBar}>
                                <TouchableOpacity
                                    style={styles.iOSDoneButton}
                                    onPress={this.onPressCancelIOS}>
                                    <Text style={styles.iOSDoneButtonText}>
                                        {'Cancel'}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.iOSDoneButton}
                                    onPress={this.onPressDoneIOS}>
                                    <Text style={styles.iOSDoneButtonText}>
                                        {'Done'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <Picker
                                itemStyle={styles.iOSItemStyle}
                                selectedValue={this.state.selectedValue}
                                onValueChange={this.onPickerValueChangedIOS}>
                                {children}
                            </Picker>
                        </SafeAreaView>
                    </View>
                </Modal>
            </Fragment>
        );
    }

    private renderAndroidItem(): ReactNode {
        return React.Children.map(this.props.children as SelectItem[], (child, index) => {
            const { testID, value, selectedColor } = child.props;
            let { label, color } = child.props;
            if (value === this.props.selectedValue) {
                this.labelValue = label;
                color = color || selectedColor;
            }
            if (Platform.Version >= 21) {
                label += ' ';
            }
            return (
                <Picker.Item
                    testID={testID} label={label} value={value}
                    color={color || Colors.majorText} />
            );
        });
    }

    private renderIOSItem(): ReactNode {
        return React.Children.map(this.props.children as SelectItem[], (child, index) => {
            const { testID, label, value, color } = child.props;
            if (value === this.props.selectedValue) {
                this.labelValue = label;
            }
            return (
                <Picker.Item
                    testID={testID} label={label} value={value}
                    color={color || Colors.majorText} />
            );
        });
    }
}

/**
 * Item as one child of Select
 *
 * @author Lingqi
 */
class SelectItem extends PureComponent<ItemProps> {}
interface ItemProps extends PickerItemProps {
    selectedColor?: string;
}
Select.Item = SelectItem;

const styles = StyleSheet.create({
    selectTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    triggerText: {
        flex: 1,
        paddingRight: 24,
        paddingLeft: 12,
        fontSize: 16,
        fontFamily: 'Roboto-Regular',
        letterSpacing: 0.5,
        color: Colors.majorText
    },
    triggerArrow: {
        position: 'absolute',
        width: 24,
        height: 24,
        right: 0,
        top: '50%',
        marginTop: -12,
    },
    androidNativeSelect: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
        color: 'transparent'
    },

    iOSPickerContainer: {
        flex: 1,
        backgroundColor: Colors.scrimColor,
    },
    iOSTopSpace: {
        flex: 1,
    },
    iOSItemStyle: {
        backgroundColor: 'white',
    },
    iOSDoneBar: {
        height: 44,
        backgroundColor: '#EFF1F2',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#919498',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    iOSDoneButton: {
        height: 44,
        marginHorizontal: 8,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iOSDoneButtonText: {
        fontSize: 15,
        fontFamily: 'Roboto-Medium',
        letterSpacing: 1.25,
        color: '#007AFE',
    },
    iOSSafeArea: {
        backgroundColor: 'white',
    },
});
