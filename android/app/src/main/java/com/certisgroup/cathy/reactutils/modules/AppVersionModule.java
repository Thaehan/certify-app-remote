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

import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

import java.util.HashMap;
import java.util.Map;

/**
 * RN module to export app version
 *
 * @author Lingqi
 */
public class AppVersionModule extends ReactContextBaseJavaModule {

    public AppVersionModule(@NonNull ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "AppVersion";
    }

    @Nullable
    @Override
    public Map<String, Object> getConstants() {
        Map<String, Object> constants = new HashMap<>();
        PackageManager packageManager = getReactApplicationContext().getPackageManager();
        String packageName = getReactApplicationContext().getPackageName();
        try {
            PackageInfo packageInfo = packageManager.getPackageInfo(packageName, 0);
            constants.put("versionName", packageInfo.versionName);
            constants.put("versionCode", packageInfo.versionCode);
        } catch (NameNotFoundException e) {
            e.printStackTrace();
        }
        return constants;
    }
}
