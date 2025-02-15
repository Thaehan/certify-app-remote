import React, { PureComponent, Fragment, ReactElement } from "react";
import { View, Text, ImageProps, StyleSheet, Platform } from "react-native";
import I18n from "../../../utils/I18n";
import { Colors } from "../../../utils/Colors";
import { CathyRaisedButton } from "../../../shared-components/cathy/CathyButton";

interface Props {
    title: string;
    subtitle: string;
    iconImage: ReactElement<ImageProps>;
    showLoginButton: boolean;
    onPressLogin: () => void;
}

export class IntroChildScreen extends PureComponent<Props> {
    static defaultProps = {
        showLoginButton: false,
        onPressLogin: () => {},
    };

    render() {
        return (
            <Fragment>
                <View style={styles.topSpace} />
                <Text style={styles.titleText} numberOfLines={2}>
                    {this.props.title}
                </Text>
                <View style={styles.midSpace1} />
                <View style={styles.imageContainer}>
                    {this.props.iconImage}
                </View>
                <View style={styles.midSpace2} />
                <Text style={styles.infoText} numberOfLines={2}>
                    {this.props.subtitle}
                </Text>
                <View style={styles.bottomSpace1} />
                {this.props.showLoginButton ? (
                    <CathyRaisedButton
                        text={I18n.t("intro.sign_button")}
                        onPress={this.props.onPressLogin!}
                    />
                ) : (
                    <View style={styles.buttonSpace} />
                )}
                <View style={styles.bottomSpace2} />
            </Fragment>
        );
    }
}

const styles = StyleSheet.create({
    topSpace: {
        flex: 108,
    },
    titleText: {
        height: 60,
        marginHorizontal: 24,
        fontSize: 24,
        fontFamily: "Roboto-Regular",
        lineHeight: 30,
        color: Colors.cathyMajorText,
        textAlign: "center",
    },
    midSpace1: {
        flex: 56,
    },
    imageContainer: {
        height: 140,
        alignItems: "center",
        justifyContent: "center",
    },
    midSpace2: {
        flex: 56,
    },
    infoText: {
        height: 36,
        fontSize: 14,
        fontFamily: "Roboto-Regular",
        lineHeight: 18,
        color: Colors.cathyOrange,
        textAlign: "center",
    },
    bottomSpace1: {
        flex: 68,
    },
    buttonSpace: {
        height: 48,
    },
    bottomSpace2: {
        flex: 135,
    },
});
