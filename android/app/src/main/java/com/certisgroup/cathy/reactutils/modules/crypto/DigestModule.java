/*
 * Copyright (c) 2020 Certis CISCO Security Pte Ltd
 * All rights reserved.
 *
 * This software is the confidential and proprietary information of
 * Certis CISCO Security Pte Ltd. ("Confidential Information").
 * You shall not disclose such Confidential Information and shall use
 * it only in accordance with the terms of the license agreement you
 * entered into with Certis CISCO Security Pte Ltd.
 */
package com.certisgroup.cathy.reactutils.modules.crypto;

import android.util.Base64;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * RN module for digest algorithms
 *
 * @author Lingqi
 */
public class DigestModule extends ReactContextBaseJavaModule {

    public DigestModule(@NonNull ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "CryptoDigest";
    }

    @ReactMethod
    public void digest(String algo, String data, Promise promise) {
        try {
            byte[] dataBytes = Base64.decode(data, Base64.DEFAULT);
            MessageDigest messageDigest = MessageDigest.getInstance(algo);
            byte[] digestBytes = messageDigest.digest(dataBytes);
            String digest = Base64.encodeToString(digestBytes, Base64.NO_WRAP);
            promise.resolve(digest);
        } catch (NoSuchAlgorithmException | IllegalArgumentException e) {
            promise.reject("DIGEST_ERROR", e.getMessage(), e);
        }
    }
}
