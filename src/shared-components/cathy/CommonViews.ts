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
import {
    StyleSheet,
} from 'react-native';
import { Colors } from '../../utils/Colors';

export const cathyViews = StyleSheet.create({
    // tslint:disable-next-line: no-unused-styles
    largeTitle: {
        fontSize: 48,
        fontFamily: 'Roboto-Regular',
        lineHeight: 56,
        textAlign: 'center',
        color: Colors.cathyMajorText,
    },
    // tslint:disable-next-line: no-unused-styles
    title: {
        fontSize: 28,
        fontFamily: 'Roboto-Regular',
        lineHeight: 32,
        textAlign: 'center',
        color: Colors.cathyMajorText,
    },
    // tslint:disable-next-line: no-unused-styles
    subtitle: {
        fontSize: 14,
        fontFamily: 'Roboto-Regular',
        lineHeight: 16,
        textAlign: 'center',
        color: Colors.cathyOrange,
    },
    // tslint:disable-next-line: no-unused-styles
    countDown: {
        fontSize: 14,
        fontFamily: 'Roboto-Regular',
        lineHeight: 36,
        textAlign: 'center',
        color: Colors.helperText,
        fontWeight: 'bold',
    },
    // tslint:disable-next-line: no-unused-styles
    bottomLogo: {
        position: 'absolute',
        alignSelf: 'center',
        width: 96,
        height: 24,
        bottom: 36,
        zIndex: 2,
    },
    // tslint:disable-next-line: no-unused-styles
    usernameContainer: {
        height: 56,
        flexDirection: 'row',
    },
    // tslint:disable-next-line: no-unused-styles
    userCodeSelect: {
        marginLeft: 24,
        width: 68,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: Colors.cathyBlueBorder,
        backgroundColor: 'white',
    },
    // tslint:disable-next-line: no-unused-styles
    userCodeTriggerText: {
        color: Colors.cathyMajorText
    },
    // tslint:disable-next-line: no-unused-styles
    usernameField: {
        flex: 1,
        marginLeft: 8,
    },
});
