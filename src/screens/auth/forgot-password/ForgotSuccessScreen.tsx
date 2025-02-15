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
    Fragment,
} from 'react';
import {
    View,
    Image,
    Dimensions,
    StyleSheet,
} from 'react-native';
import { NavigationScreenProp, NavigationRoute } from 'react-navigation';
import { I18n } from '../../../utils/I18n';
import { TextFix } from '../../../shared-components/cathy/IOSFix';
import { cathyViews } from '../../../shared-components/cathy/CommonViews';

interface Props {
    navigation: NavigationScreenProp<NavigationRoute>;
}
interface State {
    countDown: number;
}

/**
 * 'Success' step of forgot-password flow
 *
 * @author Lingqi
 */
export class ForgotSuccessScreen extends PureComponent<Props, State> {

    private readonly COUNT_MAX = 3;
    private timerId!: ReturnType<typeof setInterval>;

    constructor(props: Props) {
        super(props);
        this.state = {
            countDown: this.COUNT_MAX,
        };
    }

    //**************************************************************
    // Component Lifecycle
    //****************************************************************

    componentDidMount(): void {
        this.timerId = setInterval(() => {
            if (this.state.countDown === 1) {
                this.props.navigation.navigate('Auth/Login');
            } else {
                this.setState({
                    countDown: this.state.countDown - 1
                });
            }
        }, 1000);
    }

    componentWillUnmount(): void {
        clearInterval(this.timerId);
    }

    //**************************************************************
    // Render
    //****************************************************************

    render() {
        return (
            <Fragment>
                <View style={styles.topSpace} />
                <Image
                    style={styles.successImage}
                    source={require('../../../assets/image/auth/success.png')}
                    resizeMode={'contain'} />
                <View style={styles.middleSpace1} />
                <TextFix style={cathyViews.title}>
                    {I18n.t('auth.forgot.success_title')}
                </TextFix>
                <TextFix style={[cathyViews.subtitle, styles.subtitle]}>
                    {I18n.t('auth.forgot.success_info', { count: this.state.countDown })}
                </TextFix>
                <View style={styles.bottomSpace} />
            </Fragment>
        );
    }
}

const screenHeight = Dimensions.get('screen').height;
const styles = StyleSheet.create({
    topSpace: {
        height: 100 * (screenHeight - 182) / 549,
    },
    successImage: {
        alignSelf: 'center',
        width: 83,
        height: 102,
    },
    middleSpace1: {
        height: 28 * (screenHeight - 182) / 549,
        minHeight: 16,
    },
    subtitle: {
        marginTop: 8,
    },
    bottomSpace: {
        flex: 1, // 421
    },
});
