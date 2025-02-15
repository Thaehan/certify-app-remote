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
import { NativeModules } from 'react-native';

interface IAppVersion {
    versionName: string;
    versionCode: number;
}

interface IBuildVariant {
    buildType: 'debug' | 'release' | 'staging';
}

interface IAndroidNavigationBar {
    setNavigationBarColor: (colorString: string) => void;
    setLightNavigationBar: (light: boolean) => void;
}

type AdjustOption = 'adjustUnspecified' | 'adjustResize' | 'adjustPan' | 'adjustNothing';
interface IAndroidKeyboardMode {
    setAdjustOption: (adjustOption: AdjustOption) => void;
}

/**
 * import app version from native
 *
 * @author Lingqi
 */
export const AppVersion = NativeModules.AppVersion as IAppVersion;

/**
 * import build environment from native
 *
 * @author Lingqi
 */
export const BuildVariant = NativeModules.BuildVariant as IBuildVariant;

/**
 * Android Navigation Bar handler from native
 *
 * @author Lingqi
 */
export const AndroidNavigationBar = NativeModules.AndroidNavigationBar as IAndroidNavigationBar;

/**
 * Android input method visibility handler from native
 *
 * @author Lingqi
 */
export const AndroidKeyboardMode = NativeModules.AndroidKeyboardMode as IAndroidKeyboardMode;
