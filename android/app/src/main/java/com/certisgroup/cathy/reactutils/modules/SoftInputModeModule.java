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

import android.os.Handler;
import android.os.Looper;
import android.view.Window;
import android.view.WindowManager.LayoutParams;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

/**
 * RN module for Android to handle input method visibility
 *
 * @author Lingqi
 */
public class SoftInputModeModule extends ReactContextBaseJavaModule {

    public SoftInputModeModule(@NonNull ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "AndroidKeyboardMode";
    }

    @ReactMethod
    public void setAdjustOption(String adjustOption) {
        if (getCurrentActivity() != null) {
            new Handler(Looper.getMainLooper()).post(() -> {
                Window window = getCurrentActivity().getWindow();
                switch (adjustOption) {
                    case "adjustUnspecified":
                        window.setSoftInputMode(LayoutParams.SOFT_INPUT_ADJUST_UNSPECIFIED);
                        break;
                    case "adjustResize":
                        window.setSoftInputMode(LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
                        break;
                    case "adjustPan":
                        window.setSoftInputMode(LayoutParams.SOFT_INPUT_ADJUST_PAN);
                        break;
                    case "adjustNothing":
                        window.setSoftInputMode(LayoutParams.SOFT_INPUT_ADJUST_NOTHING);
                        break;
                }
            });
        }
    }
}
