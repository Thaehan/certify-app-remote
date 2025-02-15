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
    NavigationActions,
    NavigationContainerComponent,
    NavigationParams,
} from 'react-navigation';

let navigator: NavigationContainerComponent;

function setTopLevelNavigator(navigatorRef: NavigationContainerComponent): void {
    navigator = navigatorRef;
}

function navigate(routeName: string, params?: NavigationParams): void {
    navigator.dispatch(
        NavigationActions.navigate({
            routeName,
            params,
        }),
    );
}

function back(key?: string): void {
    navigator.dispatch(
        NavigationActions.back({
            key,
        }),
    );
}

function setParams(key: string, params: NavigationParams): void {
    navigator.dispatch(
        NavigationActions.setParams({
            key,
            params
        })
    );
}

export const NavigationService = {
    setTopLevelNavigator,
    navigate,
    back,
    setParams
};
