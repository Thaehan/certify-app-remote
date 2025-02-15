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
package com.certisgroup.cathy.reactutils.modules;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.BuildConfig;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

import java.util.HashMap;
import java.util.Map;

/**
 * RN module to export build environment
 *
 * @author Lingqi
 */
public class BuildVariantModule extends ReactContextBaseJavaModule {

    public BuildVariantModule(@NonNull ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "BuildVariant";
    }

    @Nullable
    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("buildType", BuildConfig.BUILD_TYPE);
        return constants;
    }
}
