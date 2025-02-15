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
package com.certisgroup.cathy.reactutils;

import androidx.annotation.NonNull;

import com.certisgroup.cathy.reactutils.modules.AppVersionModule;
import com.certisgroup.cathy.reactutils.modules.BuildVariantModule;
import com.certisgroup.cathy.reactutils.modules.NavigationBarModule;
import com.certisgroup.cathy.reactutils.modules.SoftInputModeModule;
import com.certisgroup.cathy.reactutils.modules.crypto.AesModule;
import com.certisgroup.cathy.reactutils.modules.crypto.DigestModule;
import com.certisgroup.cathy.reactutils.modules.crypto.RsaModule;
import com.certisgroup.cathy.reactutils.views.gridlist.GridListManager;
import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.Arrays;
import java.util.List;

/**
 * Package to register custom native RN modules and views
 *
 * @author Lingqi
 */
public class CathyPackage implements ReactPackage {

    @NonNull
    @Override
    public List<ViewManager> createViewManagers(@NonNull ReactApplicationContext reactContext) {
        return Arrays.asList(
            new GridListManager()
        );
    }

    @NonNull
    @Override
    public List<NativeModule> createNativeModules(@NonNull ReactApplicationContext reactContext) {
        return Arrays.asList(
            new AppVersionModule(reactContext),
            new BuildVariantModule(reactContext),
            new NavigationBarModule(reactContext),
            new SoftInputModeModule(reactContext),
            new AesModule(reactContext),
            new DigestModule(reactContext),
            new RsaModule(reactContext)
        );
    }
}
