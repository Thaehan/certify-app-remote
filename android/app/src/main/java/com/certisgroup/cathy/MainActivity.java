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
package com.certisgroup.cathy;

import android.annotation.SuppressLint;
import android.annotation.TargetApi;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.os.Build;
import android.os.Bundle;
import android.view.KeyEvent;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactRootView;
import com.facebook.react.bridge.Callback;
import com.facebook.react.modules.core.DefaultHardwareBackBtnHandler;
import com.facebook.react.modules.core.PermissionAwareActivity;
import com.facebook.react.modules.core.PermissionListener;

/**
 * Main Activity to host ReactRootView
 *
 * @author Lingqi
 */
public class MainActivity extends AppCompatActivity
        implements DefaultHardwareBackBtnHandler, PermissionAwareActivity {

    private static final int UPDATE_CODE = 5297;
    private ReactRootView reactRootView;
    private ReactNativeHost reactHost;
    private PermissionListener permissionListener;
    private Callback permissionsCallback;

    //**************************************************************
    // Activity Overrides
    //****************************************************************

    @SuppressLint("SourceLockedOrientationActivity")
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        reactRootView = new ReactRootView(this);
        reactHost = ((MainApplication) this.getApplication()).getReactNativeHost();
        reactRootView.startReactApplication(reactHost.getReactInstanceManager(),
                                            "Cathy",
                                            getInitialProperties());
        this.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        this.setContentView(reactRootView);
    }

    @Override
    protected void onPause() {
        super.onPause();
        reactHost.getReactInstanceManager().onHostPause(this);
    }

    @Override
    protected void onResume() {
        super.onResume();
        reactHost.getReactInstanceManager().onHostResume(this, this);
        if (permissionsCallback != null) {
            permissionsCallback.invoke();
            permissionsCallback = null;
        }
//        if (!BuildConfig.DEBUG) {
//            UpdateManager updateManager = ((MainApplication) getApplication()).appUpdateManager();
//            updateManager.checkUpdate(this, UPDATE_CODE);
//        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        reactRootView.unmountReactApplication();
        reactRootView = null;
        reactHost.getReactInstanceManager().onHostDestroy(this);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        reactHost.getReactInstanceManager().onWindowFocusChange(hasFocus);
    }

//    @Override
//    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
//        reactHost.getReactInstanceManager().onActivityResult(this, requestCode, resultCode, data);
//    }

    @Override
    public boolean onKeyUp(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_MENU) {
            reactHost.getReactInstanceManager().showDevOptionsDialog();
            return true;
        }
        return super.onKeyUp(keyCode, event);
    }

    @Override
    public void onBackPressed() {
        reactHost.getReactInstanceManager().onBackPressed();
    }

//    @Override
//    protected void onNewIntent(Intent intent) {
//        reactHost.getReactInstanceManager().onNewIntent(intent);
//    }

    //**************************************************************
    // Implement DefaultHardwareBackBtnHandler
    //****************************************************************

    @Override
    public void invokeDefaultOnBackPressed() {
        super.onBackPressed();
    }

    //**************************************************************
    // Implement PermissionAwareActivity
    //****************************************************************

    @TargetApi(Build.VERSION_CODES.M)
    @Override
    public void requestPermissions(String[] permissions, int requestCode, PermissionListener listener) {
        permissionListener = listener;
        requestPermissions(permissions, requestCode);
    }

//    @Override
//    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
//        permissionsCallback = (Object... args) -> {
//            permissionListener.onRequestPermissionsResult(requestCode, permissions, grantResults);
//            permissionListener = null;
//        };
//    }

    //**************************************************************
    // Config React Native
    //****************************************************************

    private Bundle getInitialProperties() {
        return null;
    }
}
