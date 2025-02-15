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

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;

import java.math.BigInteger;
import java.security.GeneralSecurityException;
import java.security.Key;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.Signature;
import java.security.spec.AlgorithmParameterSpec;
import java.security.spec.KeySpec;
import java.security.spec.MGF1ParameterSpec;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.RSAKeyGenParameterSpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import javax.crypto.Cipher;
import javax.crypto.spec.OAEPParameterSpec;
import javax.crypto.spec.PSource;

/**
 * RN module for RSA algorithms
 *
 * @author Lingqi
 */
public class RsaModule extends ReactContextBaseJavaModule {

    private static final String PKCS1_v1_5 = "PKCS1-v1_5";
    private static final Map<String, String> SIG_DIGEST_MAP = sigDigestMap();
    private static Map<String, String> sigDigestMap() {
        Map<String, String> map = new HashMap<>();
        map.put("SHA-1", "SHA1withRSA");
        map.put("SHA-256", "SHA256withRSA");
        map.put("SHA-384", "SHA384withRSA");
        map.put("SHA-512", "SHA512withRSA");
        return map;
    }
    private static final Map<String, MGF1ParameterSpec> MGF1_SPEC_MAP = mgf1SpecMap();
    private static Map<String, MGF1ParameterSpec> mgf1SpecMap() {
        Map<String, MGF1ParameterSpec> map = new HashMap<>();
        map.put("SHA-1", MGF1ParameterSpec.SHA1);
        map.put("SHA-256", MGF1ParameterSpec.SHA256);
        map.put("SHA-384", MGF1ParameterSpec.SHA384);
        map.put("SHA-512", MGF1ParameterSpec.SHA512);
        return map;
    }

    private final Map<String, PrivateKey> privateKeyCache;
    private final Map<String, PublicKey> publicKeyCache;

    public RsaModule(@NonNull ReactApplicationContext reactContext) {
        super(reactContext);
        privateKeyCache = new HashMap<>();
        publicKeyCache = new HashMap<>();
    }

    @NonNull
    @Override
    public String getName() {
        return "CryptoRSA";
    }

    @ReactMethod
    public void sign(ReadableMap params, String uuid, String data, Promise promise) {
        if (!PKCS1_v1_5.equals(params.getString("scheme"))) {
            promise.reject("RSA_SIGN_ERROR", "Scheme not supported");
            return;
        }
        try {
            String hash = params.getString("hash");
            String algorithm = SIG_DIGEST_MAP.get(hash);
            PrivateKey privateKey = privateKeyCache.get(uuid);
            if (algorithm == null || privateKey == null) {
                throw new IllegalArgumentException("Hash or Key not valid");
            }
            byte[] dataBytes = Base64.decode(data, Base64.DEFAULT);
            Signature sig = Signature.getInstance(algorithm);
            sig.initSign(privateKey);
            sig.update(dataBytes);
            byte[] sigBytes = sig.sign();
            String signature = Base64.encodeToString(sigBytes, Base64.NO_WRAP);
            promise.resolve(signature);
        } catch (GeneralSecurityException | IllegalArgumentException e) {
            promise.reject("RSA_SIGN_ERROR", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void verify(ReadableMap params, String uuid, String data, String signature,
                       Promise promise) {
        if (!PKCS1_v1_5.equals(params.getString("scheme"))) {
            promise.reject("RSA_VERIFY_ERROR", "Scheme not supported");
            return;
        }
        try {
            String hash = params.getString("hash");
            String algorithm = SIG_DIGEST_MAP.get(hash);
            PublicKey publicKey = publicKeyCache.get(uuid);
            if (algorithm == null || publicKey == null) {
                throw new IllegalArgumentException("Hash or Key not valid");
            }
            byte[] dataBytes = Base64.decode(data, Base64.DEFAULT);
            byte[] sigBytes = Base64.decode(signature, Base64.DEFAULT);
            Signature sig = Signature.getInstance(algorithm);
            sig.initVerify(publicKey);
            sig.update(dataBytes);
            boolean valid = sig.verify(sigBytes);
            promise.resolve(valid);
        } catch (GeneralSecurityException | IllegalArgumentException e) {
            promise.reject("RSA_VERIFY_ERROR", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void encrypt(ReadableMap params, String uuid, String data, Promise promise) {
        try {
            String padding = params.getString("padding");
            PublicKey publicKey = publicKeyCache.get(uuid);
            if (padding == null || publicKey == null) {
                throw new IllegalArgumentException("Padding or Key not valid");
            }
            String result;
            switch (padding) {
                case "PKCS1":
                    result = this.pkcs1Cipher(Cipher.ENCRYPT_MODE, publicKey, data);
                    break;
                case "OAEP":
                    String hash = params.getString("hash");
                    result = this.oaepCipher(Cipher.ENCRYPT_MODE, hash, publicKey, data);
                    break;
                default:
                    promise.reject("RSA_ENCRYPT_ERROR", "Padding not supported");
                    return;
            }
            promise.resolve((result));
        } catch (GeneralSecurityException | IllegalArgumentException e) {
            promise.reject("RSA_ENCRYPT_ERROR", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void decrypt(ReadableMap params, String uuid, String data, Promise promise) {
        try {
            String padding = params.getString("padding");
            PrivateKey privateKey = privateKeyCache.get(uuid);
            if (padding == null || privateKey == null) {
                throw new IllegalArgumentException("Padding or Key not valid");
            }
            String result;
            switch (padding) {
                case "PKCS1":
                    result = this.pkcs1Cipher(Cipher.DECRYPT_MODE, privateKey, data);
                    break;
                case "OAEP":
                    String hash = params.getString("hash");
                    result = this.oaepCipher(Cipher.DECRYPT_MODE, hash, privateKey, data);
                    break;
                default:
                    promise.reject("RSA_DECRYPT_ERROR", "Padding not supported");
                    return;
            }
            promise.resolve((result));
        } catch (GeneralSecurityException | IllegalArgumentException e) {
            promise.reject("RSA_DECRYPT_ERROR", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void generateKeyPair(int modulusSize, Promise promise) {
        try {
            BigInteger publicExponent = RSAKeyGenParameterSpec.F4;
            AlgorithmParameterSpec rsaSpec = new RSAKeyGenParameterSpec(modulusSize, publicExponent);
            KeyPairGenerator keyPairGen = KeyPairGenerator.getInstance("RSA");
            keyPairGen.initialize(rsaSpec);
            KeyPair keyPair = keyPairGen.genKeyPair();
            String privateId = UUID.randomUUID().toString();
            String publicId = UUID.randomUUID().toString();
            privateKeyCache.put(privateId, keyPair.getPrivate());
            publicKeyCache.put(publicId, keyPair.getPublic());
            WritableMap privateKey = Arguments.createMap();
            privateKey.putString("uuid", privateId);
            privateKey.putString("format", "pkcs8");
            WritableMap publicKey = Arguments.createMap();
            publicKey.putString("uuid", publicId);
            publicKey.putString("format", "spki");
            WritableMap map = Arguments.createMap();
            map.putMap("privateKey", privateKey);
            map.putMap("publicKey", publicKey);
            promise.resolve(map);
        } catch (GeneralSecurityException e) {
            promise.reject("RSA_GENERATE_ERROR", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void importKey(String format, String key, Promise promise) {
        try {
            byte[] keyBytes = Base64.decode(key, Base64.DEFAULT);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            String uuid = UUID.randomUUID().toString();
            switch (format) {
                case "pkcs8":
                    KeySpec pkcs8KeySpec = new PKCS8EncodedKeySpec(keyBytes);
                    PrivateKey privateKey = keyFactory.generatePrivate(pkcs8KeySpec);
                    privateKeyCache.put(uuid, privateKey);
                    break;
                case "spki":
                    KeySpec x509KeySpec = new X509EncodedKeySpec(keyBytes);
                    PublicKey publicKey = keyFactory.generatePublic(x509KeySpec);
                    publicKeyCache.put(uuid, publicKey);
                    break;
                default:
                    promise.reject("RSA_IMPORT_ERROR", "Format not supported");
                    return;
            }
            WritableMap map = Arguments.createMap();
            map.putString("uuid", uuid);
            map.putString("format", format);
            promise.resolve(map);
        } catch (GeneralSecurityException | IllegalArgumentException e) {
            promise.reject("RSA_IMPORT_ERROR", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void exportKey(String format, String uuid, Promise promise) {
        Key key;
        switch (format) {
            case "pkcs8":
                key = privateKeyCache.get(uuid);
                break;
            case "spki":
                key = publicKeyCache.get(uuid);
                break;
            default:
                promise.reject("RSA_EXPORT_ERROR", "Format not supported");
                return;
        }
        if (key != null) {
            byte[] keyBytes = key.getEncoded();
            String keyString = Base64.encodeToString(keyBytes, Base64.NO_WRAP);
            promise.resolve(keyString);
        } else {
            promise.reject("RSA_EXPORT_ERROR", "Key does not exist");
        }
    }

    private String pkcs1Cipher(int op, Key key, String data)
            throws GeneralSecurityException, IllegalArgumentException {
        Cipher cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding");
        cipher.init(op, key);
        byte[] input = Base64.decode(data, Base64.DEFAULT);
        byte[] result = cipher.doFinal(input);
        return Base64.encodeToString(result, Base64.NO_WRAP);
    }

    private String oaepCipher(int op, String hash, Key key, String data)
            throws GeneralSecurityException, IllegalArgumentException {
        Cipher cipher = Cipher.getInstance("RSA/ECB/OAEPPadding");
        MGF1ParameterSpec mgf1Spec = MGF1_SPEC_MAP.get(hash);
        if (mgf1Spec == null) {
            throw new IllegalArgumentException("Hash not valid");
        }
        OAEPParameterSpec oaepSpec = new OAEPParameterSpec(hash, "MGF1", mgf1Spec,
            PSource.PSpecified.DEFAULT);
        cipher.init(op, key, oaepSpec);
        byte[] input = Base64.decode(data, Base64.DEFAULT);
        byte[] result = cipher.doFinal(input);
        return Base64.encodeToString(result, Base64.NO_WRAP);
    }
}
