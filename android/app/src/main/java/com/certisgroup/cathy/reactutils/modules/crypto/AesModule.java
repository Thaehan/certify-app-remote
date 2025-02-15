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

import java.security.GeneralSecurityException;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

/**
 * RN module for AES algorithms
 *
 * @author Lingqi
 */
public class AesModule extends ReactContextBaseJavaModule {

    private static final String AES_ALGO = "AES";
    private static final Map<String, String> PADDING_MAP = paddingMap();
    private static Map<String, String> paddingMap() {
        Map<String, String> map = new HashMap<>();
        map.put("CBC", "PKCS5Padding");
        map.put("CTR", "NoPadding");
        map.put("CFB8", "NoPadding");
        return map;
    }

    public AesModule(@NonNull ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "CryptoAES";
    }

    @ReactMethod
    public void encrypt(String mode, String iv, String key, String data, Promise promise) {
        try {
            String result = this.transform(Cipher.ENCRYPT_MODE, mode, iv, key, data);
            promise.resolve(result);
        } catch (GeneralSecurityException | IllegalArgumentException e) {
            promise.reject("AES_ENCRYPT_ERROR", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void decrypt(String mode, String iv, String key, String data, Promise promise) {
        try {
            String result = this.transform(Cipher.DECRYPT_MODE, mode, iv, key, data);
            promise.resolve((result));
        } catch (GeneralSecurityException | IllegalArgumentException e) {
            promise.reject("AES_DECRYPT_ERROR", e.getMessage(), e);
        }
    }

    private String transform(int op, String mode, String iv, String key, String data)
            throws GeneralSecurityException, IllegalArgumentException {
        String padding = PADDING_MAP.get(mode);
        if (padding == null) {
            throw new IllegalArgumentException("Mode not supported");
        }
        byte[] ivBytes = Base64.decode(iv, Base64.DEFAULT);
        byte[] keyBytes = Base64.decode(key, Base64.DEFAULT);
        byte[] dataBytes = Base64.decode(data, Base64.DEFAULT);
        SecretKey secretKey = new SecretKeySpec(keyBytes, AES_ALGO);
        IvParameterSpec ivParamSpec = new IvParameterSpec(ivBytes);
        Cipher cipher = Cipher.getInstance(AES_ALGO + "/" + mode + "/" + padding);
        cipher.init(op, secretKey, ivParamSpec);
        byte[] resultBytes =  cipher.doFinal(dataBytes);
        return Base64.encodeToString(resultBytes, Base64.NO_WRAP);
    }
}
