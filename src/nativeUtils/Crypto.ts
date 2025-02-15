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
import { NativeModules } from 'react-native';
import Base64 from 'base64-js';

const CryptoDigest = NativeModules.CryptoDigest;
const CryptoAES = NativeModules.CryptoAES;
const CryptoRSA = NativeModules.CryptoRSA;

type AES_Mode = 'CBC' | 'CTR' | 'CFB8';
type KeyFormat = 'pkcs8' | 'spki';
type Hash = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';
type ModulusSize = 512 | 768 | 1024 | 2048 | 3072 | 4096;

export interface SigParams {
    scheme: 'PKCS1-v1_5';
    hash: Hash;
}
export interface Pkcs1Params {
    padding: 'PKCS1';
}
export interface OaepParams {
    padding: 'OAEP';
    hash: Hash;
}
export interface RsaKey {
    uuid: string;
    format: KeyFormat;
}
export interface RsaKeyPair {
    privateKey: RsaKey;
    publicKey: RsaKey;
}

/**
 * Native Crypto module. API similar to Web Crypto (window.crypto.subtle)
 *
 * @author Lingqi
 */
export const Crypto = {
    digest(alg: Hash, dataBytes: Uint8Array): Promise<Uint8Array> {
        return new Promise((resolve, reject) => {
            const data = Base64.fromByteArray(dataBytes);
            CryptoDigest.digest(alg, data).then((result: string) => {
                resolve(Base64.toByteArray(result));
            }).catch((error: Error) => {
                reject(error);
            });
        });
    },
    AES: {
        encrypt(mode: AES_Mode, ivBytes: Uint8Array, keyBytes: Uint8Array, dataBytes: Uint8Array): Promise<Uint8Array> {
            return new Promise((resolve, reject) => {
                const iv = Base64.fromByteArray(ivBytes);
                const key = Base64.fromByteArray(keyBytes);
                const data = Base64.fromByteArray(dataBytes);
                CryptoAES.encrypt(mode, iv, key, data).then((result: string) => {
                    resolve(Base64.toByteArray(result));
                }).catch((error: Error) => {
                    reject(error);
                });
            });
        },
        decrypt(mode: AES_Mode, ivBytes: Uint8Array, keyBytes: Uint8Array, dataBytes: Uint8Array): Promise<Uint8Array> {
            return new Promise((resolve, reject) => {
                const iv = Base64.fromByteArray(ivBytes);
                const key = Base64.fromByteArray(keyBytes);
                const data = Base64.fromByteArray(dataBytes);
                CryptoAES.decrypt(mode, iv, key, data).then((result: string) => {
                    resolve(Base64.toByteArray(result));
                }).catch((error: Error) => {
                    reject(error);
                });
            });
        }
    },
    RSA: {
        sign(params: SigParams, key: RsaKey, dataBytes: Uint8Array): Promise<Uint8Array> {
            return new Promise((resolve, reject) => {
                const dataString = Base64.fromByteArray(dataBytes);
                CryptoRSA.sign(params, key.uuid, dataString).then((signature: string) => {
                    resolve(Base64.toByteArray(signature));
                }).catch((error: Error) => {
                    reject(error);
                });
            });
        },
        verify(params: SigParams, key: RsaKey, dataBytes: Uint8Array, signature: Uint8Array): Promise<boolean> {
            const dataString = Base64.fromByteArray(dataBytes);
            const signatureString = Base64.fromByteArray(signature);
            return CryptoRSA.verify(params, key.uuid, dataString, signatureString);
        },
        encrypt(params: Pkcs1Params | OaepParams, key: RsaKey, dataBytes: Uint8Array): Promise<Uint8Array> {
            return new Promise((resolve, reject) => {
                const dataString = Base64.fromByteArray(dataBytes);
                CryptoRSA.encrypt(params, key.uuid, dataString).then((result: string) => {
                    resolve(Base64.toByteArray(result));
                }).catch((error: Error) => {
                    reject(error);
                });
            });
        },
        decrypt(params: Pkcs1Params | OaepParams, key: RsaKey, dataBytes: Uint8Array): Promise<Uint8Array> {
            return new Promise((resolve, reject) => {
                const dataString = Base64.fromByteArray(dataBytes);
                CryptoRSA.decrypt(params, key.uuid, dataString).then((result: string) => {
                    resolve(Base64.toByteArray(result));
                }).catch((error: Error) => {
                    reject(error);
                });
            });
        },
        generateKeyPair(modulusSize: ModulusSize): Promise<RsaKeyPair> {
            return CryptoRSA.generateKeyPair(modulusSize);
        },
        importKey(format: KeyFormat, keyBytes: Uint8Array): Promise<RsaKey> {
            const keyString = Base64.fromByteArray(keyBytes);
            return CryptoRSA.importKey(format, keyString);
        },
        exportKey(format: KeyFormat, key: RsaKey): Promise<Uint8Array> {
            return new Promise((resolve, reject) => {
                CryptoRSA.exportKey(format, key.uuid).then((keyString: string) => {
                    resolve(Base64.toByteArray(keyString));
                }).catch((error: Error) => {
                    reject(error);
                });
            });
        }
    }
};
