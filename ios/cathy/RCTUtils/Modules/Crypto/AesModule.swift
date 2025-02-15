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
 * RN module for AES algorithms
 *
 * @author Lingqi
 */
@objc(CryptoAES)
class AesModule: NSObject {
    
    private let AES_ALGO = CCAlgorithm(kCCAlgorithmAES)
    private let MODE_DICT = [
        "CBC": CCMode(kCCModeCBC),
        "CTR": CCMode(kCCModeCTR),
        "CFB8": CCMode(kCCModeCFB8)
    ]
    private let PADDING_DICT = [
        "CBC": CCPadding(ccPKCS7Padding),
        "CTR": CCPadding(ccNoPadding),
        "CFB8": CCPadding(ccNoPadding)
    ]
    private let CTR_OPTION = CCModeOptions(kCCModeOptionCTR_BE)
    
    @objc(encrypt::::::)
    func encrypt(mode: String, iv: String, key: String, data: String,
                 resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        do {
            let op = CCOperation(kCCEncrypt)
            let result = try self.transform(op: op, mode: mode, iv: iv, key: key, data: data);
            resolve(result)
        } catch let error {
            reject("AES_ENCRYPT_ERROR", error.localizedDescription, error)
        }
    }
    
    @objc(decrypt::::::)
    func decrypt(mode: String, iv: String, key: String, data: String,
                 resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
        do {
            let op = CCOperation(kCCDecrypt)
            let result = try self.transform(op: op, mode: mode, iv: iv, key: key, data: data)
            resolve(result)
        } catch let error {
            reject("AES_DECRYPT_ERROR", error.localizedDescription, error)
        }
    }
    
    private func transform(op: CCOperation, mode: String, iv: String, key: String, data: String) throws -> String {
        guard let padding = PADDING_DICT[mode],
            let ivData = Data(base64Encoded: iv),
            let keyData = Data(base64Encoded: key),
            let dataBuffer = Data(base64Encoded: data) else {
                throw CCError.kParamError
        }
        let ivBytes = [UInt8](ivData),
            keyBytes = [UInt8](keyData),
            dataIn = [UInt8](dataBuffer)
        var cryptorRef: CCCryptorRef?
        var status = CCCryptorCreateWithMode(op, MODE_DICT[mode]!, AES_ALGO, padding,
                ivBytes, keyBytes, keyBytes.count, nil, 0, 0, CTR_OPTION, &cryptorRef)
        if status != kCCSuccess {
            CCCryptorRelease(cryptorRef)
            throw CCError(rawValue: status)!
        }
        let dataOutAvailable = CCCryptorGetOutputLength(cryptorRef, dataIn.count, true)
        var dataOut = [UInt8](repeating: 0, count: dataOutAvailable)
        var dataOutMoved = 0
        var totalLength = 0
        status = CCCryptorUpdate(cryptorRef, dataIn, dataIn.count,
                                 &dataOut, dataOutAvailable, &dataOutMoved)
        if status != kCCSuccess {
            CCCryptorRelease(cryptorRef)
            throw CCError(rawValue: status)!
        }
        totalLength += dataOutMoved
        status = CCCryptorFinal(cryptorRef,
                                (&dataOut + dataOutMoved) as UnsafeMutableRawPointer,
                                dataOutAvailable - dataOutMoved,
                                &dataOutMoved)
        CCCryptorRelease(cryptorRef)
        if status != kCCSuccess  {
            throw CCError(rawValue: status)!
        }
        totalLength += dataOutMoved
        let resultData = Data(bytes: dataOut, count: totalLength);
        return resultData.base64EncodedString()
    }
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
}

private enum CCError: CCCryptorStatus, Error {
    case kParamError     = -4300
    case kBufferTooSmall = -4301
    case kMemoryFailure  = -4302
    case kAlignmentError = -4303
    case kDecodeError    = -4304
    case kUnimplemented  = -4305
    case kOverflow       = -4306
    case kKeySizeError   = -4310
}

private let ERROR_DICT: [CCError: String] = [
    .kParamError: "Illegal parameter value",
    .kBufferTooSmall: "Insufficent buffer provided for specified operation",
    .kMemoryFailure: "Memory allocation failure",
    .kAlignmentError: "Input size was not aligned properly",
    .kDecodeError: "Input data did not decode or decrypt properly",
    .kUnimplemented: "Function not implemented for the current algorithm",
    .kOverflow: "Data size overflow",
    .kKeySizeError: "Key size not supported",
]

extension CCError: LocalizedError {
    var errorDescription: String? {
        return ERROR_DICT[self]
    }
}
