import React, { PureComponent } from 'react';
import {
    View,
    StyleSheet,
    TouchableWithoutFeedback,
    StyleProp,
    ViewStyle,
} from 'react-native';

interface Props {
    numberOfPages: number;
    pageIndicatorTintColor: string;
    currentPageIndicatorTintColor: string;
    indicatorRadius: number;
    onIndicatorPress: (index: number) => void;
}
interface State {
    currentPage: number;
}
export class PageIndicator extends PureComponent<Props, State> {

    static defaultProps = {
        pageIndicatorTintColor: 'rgb(158, 158, 158)',
        currentPageIndicatorTintColor: 'rgb(97, 97, 97)',
        indicatorRadius: 3.5,
        onIndicatorPress: () => { },
    };

    constructor(props: Props) {
        super(props);
        this.state = {
            currentPage: 0,
        };
    }

    setCurrentPage(index: number) {
        index = Math.max(0, index);
        index = Math.min(this.props.numberOfPages, index);
        this.setState({ currentPage: index });
    }

    render() {
        const { numberOfPages, pageIndicatorTintColor, currentPageIndicatorTintColor } = this.props;
        const diameter = this.props.indicatorRadius * 2;
        const containerStyle: StyleProp<ViewStyle> = {
            height: diameter,
            bottom: 48 - diameter,
        };
        if (numberOfPages > 0) {
            return (
                <View style={[styles.container, containerStyle]}>
                    {[...Array(numberOfPages).keys()].map((value, index) => (
                        <PageIndicatorItem
                            key={value}
                            color={index === this.state.currentPage ?
                                currentPageIndicatorTintColor : pageIndicatorTintColor
                            }
                            radius={this.props.indicatorRadius}
                            onPress={() => {
                                this.props.onIndicatorPress(index);
                            }} />
                    ))}
                </View>
            );
        } else {
            return (
                <View />
            );
        }
    }
}

interface ItemProps {
    color: string;
    radius: number;
    onPress: () => void;
}
class PageIndicatorItem extends PureComponent<ItemProps> {
    render() {
        const { radius } = this.props;
        const itemStyle: StyleProp<ViewStyle> = {
            width: radius * 2,
            height: radius * 2,
            borderRadius: radius,
            marginHorizontal: radius * 1.25,
            opacity: 0.5,
            backgroundColor: this.props.color,
        };
        return (
            <TouchableWithoutFeedback
                onPress={this.props.onPress}>
                <View style={itemStyle} />
            </TouchableWithoutFeedback>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: 0,
        left: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
