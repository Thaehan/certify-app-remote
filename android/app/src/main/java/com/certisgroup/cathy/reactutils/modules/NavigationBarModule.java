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

import android.graphics.Color;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.view.Window;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

/**
 * RN module to modify Android navigation bar
 *
 * @author Lingqi
 */
public class NavigationBarModule extends ReactContextBaseJavaModule {

    public NavigationBarModule(@NonNull ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "AndroidNavigationBar";
    }

    @ReactMethod
    public void setNavigationBarColor(String colorString) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP && getCurrentActivity() != null) {
            new Handler(Looper.getMainLooper()).post(() -> {
                Window window = getCurrentActivity().getWindow();
                window.setNavigationBarColor(Color.parseColor(colorString));
            });
        }
    }

    @ReactMethod
    public void setLightNavigationBar(boolean light) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && getCurrentActivity() != null) {
            new Handler(Looper.getMainLooper()).post(() -> {
                View decorView = getCurrentActivity().getWindow().getDecorView();
                int visibility = decorView.getSystemUiVisibility();
                if (light) {
                    visibility |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
                } else {
                    visibility &= ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
                }
                decorView.setSystemUiVisibility(visibility);
            });
        }
    }
}
