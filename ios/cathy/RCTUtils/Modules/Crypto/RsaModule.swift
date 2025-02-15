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
import Foundation
import Security
import CommonCrypto

/**
 * RN module for RSA algorithms
 *
 * @author Lingqi
 */
@objc(CryptoRSA)
class RsaModule: NSObject {
    
    private let PKCS1_v1_5 = "PKCS1-v1_5";
    private let SIG_HASH_DICT: [String: SecPadding] = [
        "SHA-1": .PKCS1SHA1,
        "SHA-256": .PKCS1SHA256,
        "SHA-384": .PKCS1SHA384,
        "SHA-512": .PKCS1SHA512
    ]
    private let DIGEST_LEN_DICT = [
        "SHA-1": CC_SHA1_DIGEST_LENGTH,
        "SHA-256": CC_SHA256_DIGEST_LENGTH,
        "SHA-384": CC_SHA384_DIGEST_LENGTH,
        "SHA-512": CC_SHA512_DIGEST_LENGTH
    ];
    private let SHA_FUNC_DICT = [
        "SHA-1": CC_SHA1,
        "SHA-256": CC_SHA256,
        "SHA-384": CC_SHA384,
        "SHA-512": CC_SHA512
    ]
    private let PRIVATE_TAG = Data("PRIVATE_KEY".utf8)
    private let PUBLIC_TAG = Data("PUBLIC_KEY".utf8)
    
    private var privateKeyCache: [String: SecKey]
    private var publicKeyCache: [String: SecKey]
    
    override init() {
        privateKeyCache = [:]
        publicKeyCache = [:]
        super.init()
    }
    
    @objc(sign:::::)
    func sign(params: [String: String], uuid: String, data: String,
              resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        if params["scheme"] != PKCS1_v1_5 {
            reject("RSA_SIGN_ERROR", "Scheme not supported", nil)
            return
        }
        do {
            guard let hash = params["hash"],
                let padding = SIG_HASH_DICT[hash],
                let key = privateKeyCache[uuid],
                let dataBuffer = Data(base64Encoded: data) else {
                    throw SecError.errParam
            }
            let dataBytes = [UInt8](dataBuffer)
            var digest = [UInt8](repeating: 0, count: Int(DIGEST_LEN_DICT[hash]!))
            _ = SHA_FUNC_DICT[hash]!(dataBytes, CC_LONG(dataBytes.count), &digest)
            var sigLen = SecKeyGetBlockSize(key)
            var sig = [UInt8](repeating: 0, count: sigLen)
            let status = SecKeyRawSign(key, padding, digest, digest.count, &sig, &sigLen)
            if status != errSecSuccess {
                throw SecError(rawValue: status)!
            }
            let sigData = Data(bytes: sig, count: sigLen)
            let signature = sigData.base64EncodedString()
            resolve(signature)
        } catch let error {
            reject("RSA_SIGN_ERROR", error.localizedDescription, error)
        }
    }
    
    @objc(verify::::::)
    func verify(params: [String: String], uuid: String, data: String, signature: String,
                resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        if params["scheme"] != PKCS1_v1_5 {
            reject("RSA_VERIFY_ERROR", "Scheme not supported", nil)
            return
        }
        do {
            guard let hash = params["hash"],
                let padding = SIG_HASH_DICT[hash],
                let key = publicKeyCache[uuid],
                let dataBuffer = Data(base64Encoded: data),
                let sigData = Data(base64Encoded: signature) else {
                    throw SecError.errParam
            }
            let dataBytes = [UInt8](dataBuffer)
            var digest = [UInt8](repeating: 0, count: Int(DIGEST_LEN_DICT[hash]!))
            _ = SHA_FUNC_DICT[hash]!(dataBytes, CC_LONG(dataBytes.count), &digest)
            let sig = [UInt8](sigData)
            let status = SecKeyRawVerify(key, padding, digest, digest.count, sig, sig.count)
            if status != errSecSuccess && status != errSSLCrypto {
                throw SecError(rawValue: status)!
            }
            let verified = status == errSecSuccess
            resolve(verified)
        } catch let error {
            reject("RSA_VERIFY_ERROR", error.localizedDescription, error)
        }
    }
    
    @objc(encrypt:::::)
    func encrypt(params: [String: String], uuid: String, data: String,
                 resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        do {
            guard let padding = params["padding"],
                let key = publicKeyCache[uuid] else {
                    throw SecError.errParam
            }
            let result: String
            switch padding {
                case "PKCS1":
                    result = try cipher(op: .encrypt, padding: .PKCS1, key: key, data: data)
                case "OAEP":
                    if params["hash"] != "SHA-1" { throw SecError.errParam }
                    result = try cipher(op: .encrypt, padding: .OAEP, key: key, data: data)
                default:
                    reject("RSA_ENCRYPT_ERROR", "Padding not supported", nil)
                    return
            }
            resolve(result)
        } catch let error {
            reject("RSA_ENCRYPT_ERROR", error.localizedDescription, error)
        }
    }
    
    @objc(decrypt:::::)
    func decrypt(params: [String: String], uuid: String, data: String,
                 resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        do {
            guard let padding = params["padding"],
                let key = privateKeyCache[uuid] else {
                    throw SecError.errParam
            }
            let result: String
            switch padding {
                case "PKCS1":
                    result = try cipher(op: .decrypt, padding: .PKCS1, key: key, data: data)
                case "OAEP":
                    if params["hash"] != "SHA-1" { throw SecError.errParam }
                    result = try cipher(op: .decrypt, padding: .OAEP, key: key, data: data)
                default:
                    reject("RSA_DECRYPT_ERROR", "Padding not supported", nil)
                    return
            }
            resolve(result)
        } catch let error {
            reject("RSA_DECRYPT_ERROR", error.localizedDescription, error)
        }
    }
    
    @objc(generateKeyPair:::)
    func generateKeyPair(modulusSize: Int, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        do {
            let parameters: [CFString: Any] = [
                kSecAttrKeyType: kSecAttrKeyTypeRSA,
                kSecAttrKeySizeInBits: modulusSize
            ]
            var publicKey: SecKey?
            var privateKey: SecKey?
            let status = SecKeyGeneratePair(parameters as CFDictionary, &publicKey, &privateKey)
            if status != errSecSuccess {
                throw SecError(rawValue: status)!
            }
            let publicId = UUID().uuidString
            let privateId = UUID().uuidString
            publicKeyCache[publicId] = publicKey!
            privateKeyCache[privateId] = privateKey!
            let dict = [
                "privateKey": [
                    "uuid": privateId,
                    "format": "pkcs8"
                ],
                "publicKey": [
                    "uuid": publicId,
                    "format": "spki"
                ]
            ]
            resolve(dict)
        } catch let error {
            reject("RSA_GENERATE_ERROR", error.localizedDescription, error)
        }
    }
    
    @objc(importKey::::)
    func importKey(format: String, key: String,
                   resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        do {
            guard let keyData = Data(base64Encoded: key) else {
                throw SecError.errParam
            }
            let uuid = UUID().uuidString
            switch format {
                case "pkcs8":
                    let keyClass = kSecAttrKeyClassPrivate
                    let key = try self.createKeyWithData(keyData: keyData, keyClass: keyClass)
                    privateKeyCache[uuid] = key
                case "spki":
                    let keyClass = kSecAttrKeyClassPublic
                    let key = try self.createKeyWithData(keyData: keyData, keyClass: keyClass)
                    publicKeyCache[uuid] = key
                default:
                    reject("RSA_IMPORT_ERROR", "Format not supported", nil)
                    return
            }
            let dict = [
                "uuid": uuid,
                "format": format
            ]
            resolve(dict)
        } catch let error {
            reject("RSA_IMPORT_ERROR", error.localizedDescription, error)
        }
    }
    
    @objc(exportKey::::)
    func exportKey(format: String, uuid: String,
                   resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        let key: SecKey?
        let keyClass: CFString
        switch format {
            case "pkcs8":
                key = privateKeyCache[uuid]
                keyClass = kSecAttrKeyClassPrivate
            case "spki":
                key = publicKeyCache[uuid]
                keyClass = kSecAttrKeyClassPublic
            default:
                reject("RSA_EXPORT_ERROR", "Format not supported", nil)
                return
        }
        if let key = key {
            let keyData = self.copyKeyToExternal(key: key, keyClass: keyClass)
            let keyString = keyData.base64EncodedString()
            resolve(keyString)
        } else {
            reject("RSA_EXPORT_ERROR", "Key does not exist", nil)
        }
    }
    
    private func cipher(op: SecOperation, padding: SecPadding, key: SecKey, data: String) throws -> String {
        guard let dataBuffer = Data(base64Encoded: data) else {
            throw SecError.errParam
        }
        let input = [UInt8](dataBuffer)
        var textLen = SecKeyGetBlockSize(key)
        var text = [UInt8](repeating: 0, count: textLen)
        let status: OSStatus
        switch op {
            case .encrypt:
                status = SecKeyEncrypt(key, padding, input, input.count, &text, &textLen)
            case .decrypt:
                status = SecKeyDecrypt(key, padding, input, input.count, &text, &textLen)
        }
        if status != errSecSuccess {
            throw SecError(rawValue: status)!
        }
        let result = Data(bytes: text, count: textLen)
        return result.base64EncodedString()
    }
    
    /// Don't use SecKeyCreateWithData, it can't handle pkcs8
    private func createKeyWithData(keyData: Data, keyClass: CFString) throws -> SecKey {
        guard let keyData = keyClass == kSecAttrKeyClassPrivate ?
            Pkcs8Util.stripPkcs8Header(keyData: keyData) :
            Pkcs8Util.stripSpkiHeader(keyData: keyData) else {
                throw SecError.errDecode
        }
        let tag = keyClass == kSecAttrKeyClassPrivate ? PRIVATE_TAG : PUBLIC_TAG
        self.deleteSecKey(tag: tag)
        let attributes: [CFString: Any] = [
            kSecClass: kSecClassKey,
            kSecAttrKeyType: kSecAttrKeyTypeRSA,
            kSecAttrApplicationTag: tag,
            kSecAttrKeyClass: keyClass,
            kSecValueData: keyData,
            kSecReturnRef: true
        ]
        var key: CFTypeRef?
        let status = SecItemAdd(attributes as CFDictionary, &key)
        if status != errSecSuccess {
            throw SecError(rawValue: status)!
        }
        self.deleteSecKey(tag: tag)
        return key as! SecKey
    }
    
    /// Don't use SecKeyCopyExternalRepresentation, it can't handle pkcs8
    private func copyKeyToExternal(key: SecKey, keyClass: CFString) -> Data {
        let tag = keyClass == kSecAttrKeyClassPrivate ? PRIVATE_TAG : PUBLIC_TAG
        self.deleteSecKey(tag: tag)
        let attributes: [CFString: Any] = [
            kSecClass: kSecClassKey,
            kSecAttrKeyType: kSecAttrKeyTypeRSA,
            kSecAttrApplicationTag: tag,
            kSecAttrKeyClass: keyClass,
            kSecValueRef: key,
            kSecReturnData: true
        ]
        var keyData: CFTypeRef?
        SecItemAdd(attributes as CFDictionary, &keyData)
        self.deleteSecKey(tag: tag)
        if keyClass == kSecAttrKeyClassPrivate {
            return Pkcs8Util.addPkcs8Header(keyData: keyData as! Data)
        } else {
            return Pkcs8Util.addSpkiHeader(keyData: keyData as! Data)
        }
    }
    
    private func deleteSecKey(tag: Data) {
        let query: [CFString: Any] = [
            kSecClass: kSecClassKey,
            kSecAttrKeyType: kSecAttrKeyTypeRSA,
            kSecAttrApplicationTag: tag
        ]
        SecItemDelete(query as CFDictionary)
    }
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
}

private enum SecOperation {
    case encrypt
    case decrypt
}

private enum SecError: OSStatus, Error {
    case errUnimplemented = -4
    case errIO            = -36
    case errParam         = -50
    case errAllocate      = -108
    case errBadReq        = -909
    case errInternalComponent = -2070
    case errCrypto        = -9809
    case errNotAvailable  = -25291
    case errDuplicateItem = -25299
    case errItemNotFound  = -25300
    case errDecode        = -26275
}

private let ERROR_DICT: [SecError: String] = [
    .errUnimplemented: "Function or operation not implemented",
    .errIO: "I/O error (bummers)",
    .errParam: "One or more parameters passed to a function were not valid",
    .errAllocate: "Failed to allocate memory",
    .errBadReq: "Bad parameter or invalid state for operation",
    .errInternalComponent: "An internal component experienced an error",
    .errCrypto: "Underlying cryptographic error",
    .errNotAvailable: "No keychain is available",
    .errDuplicateItem: "The specified item already exists in the keychain",
    .errItemNotFound: "The specified item could not be found in the keychain",
    .errDecode: "Unable to decode the provided data",
]

extension SecError: LocalizedError {
    var errorDescription: String? {
        return ERROR_DICT[self]
    }
}
