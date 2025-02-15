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
import { createNavigationContainerRef } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef<any>();

function navigate(name: string, params?: object): void {
    if (navigationRef.isReady()) {
        navigationRef.navigate(name as string, params as any);
    }
}

function back(): void {
    if (navigationRef.isReady()) {
        navigationRef.goBack();
    }
}

function setParams(params: object): void {
    if (navigationRef.isReady()) {
        navigationRef.setParams(params);
    }
}

export const NavigationService = {
    navigationRef,
    navigate,
    back,
    setParams,
};
