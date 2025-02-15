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
import CommonCrypto

/**
 * RN module for digest algorithms
 *
 * @author Lingqi
 */
@objc(CryptoDigest)
class DigestModule: NSObject {
    
    @objc(digest::::)
    func digest(algo: String, data: String,
                resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        guard let dataBuffer = Data(base64Encoded: data) else {
            reject("DIGEST_ERROR", "Data is not base64 encoded", nil)
            return
        }
        let dataBytes = [UInt8](dataBuffer)
        var digest: [UInt8]
        switch algo {
            case "SHA-1":
                digest = [UInt8](repeating: 0, count: Int(CC_SHA1_DIGEST_LENGTH))
                CC_SHA1(dataBytes, CC_LONG(dataBytes.count), &digest)
            case "SHA-256":
                digest = [UInt8](repeating: 0, count: Int(CC_SHA256_DIGEST_LENGTH))
                CC_SHA256(dataBytes, CC_LONG(dataBytes.count), &digest)
            case "SHA-384":
                digest = [UInt8](repeating: 0, count: Int(CC_SHA384_DIGEST_LENGTH))
                CC_SHA384(dataBytes, CC_LONG(dataBytes.count), &digest)
            case "SHA-512":
                digest = [UInt8](repeating: 0, count: Int(CC_SHA512_DIGEST_LENGTH))
                CC_SHA512(dataBytes, CC_LONG(dataBytes.count), &digest)
            default:
                reject("DIGEST_ERROR", "algorithm not supported", nil)
                return
        }
        let digestData = Data(bytes: digest, count: digest.count)
        let digestString = digestData.base64EncodedString()
        resolve(digestString)
    }
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
}
