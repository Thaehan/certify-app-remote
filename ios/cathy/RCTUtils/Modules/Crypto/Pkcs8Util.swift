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

/**
 * Util class for pkcs8 and spki format
 *
 * @author Lingqi
 */
class Pkcs8Util {
    private static let SEQIOD: [UInt8] = [0x30, 0x0D, 0x06, 0x09, 0x2A,
        0x86, 0x48, 0x86, 0xF7, 0x0D, 0x01, 0x01, 0x01, 0x05, 0x00]
    
    static func stripPkcs8Header(keyData: Data) -> Data? {
        var keyBytes = [UInt8](keyData)
        if keyBytes.count < 27 { return nil }
        var index = 0
        if keyBytes[index] != 0x30 { return nil }
        index += 1
        if keyBytes[index] > 0x80 {
            index += Int(keyBytes[index]) - 0x80
        }
        index += 1
        if keyBytes[index] != 0x02 { return nil }
        index += 3
        if memcmp(UnsafePointer(&keyBytes) + index, SEQIOD, 15) != 0 {
            return nil
        }
        index += 15
        if keyBytes[index] != 0x04 { return nil }
        index += 1
        if keyBytes[index] > 0x80 {
            index += Int(keyBytes[index]) - 0x80
        }
        index += 1
        if keyBytes[index] != 0x30 { return nil }
        return Data(bytes: &keyBytes + index,
                    count: keyData.count - index)
    }
    
    static func stripSpkiHeader(keyData: Data) -> Data? {
        var keyBytes = [UInt8](keyData)
        if keyBytes.count < 25 { return nil }
        var index = 0
        if keyBytes[index] != 0x30 { return nil }
        index += 1
        if keyBytes[index] > 0x80 {
            index += Int(keyBytes[index]) - 0x80
        }
        index += 1
        if memcmp(UnsafePointer(&keyBytes) + index, SEQIOD, 15) != 0 {
            return nil
        }
        index += 15
        if keyBytes[index] != 0x03 { return nil }
        index += 1
        if keyBytes[index] > 0x80 {
            index += Int(keyBytes[index]) - 0x80
        }
        index += 1
        if keyBytes[index] != 0x00 { return nil }
        index += 1
        return Data(bytes: &keyBytes + index,
                    count: keyData.count - index)
    }
    
    static func addPkcs8Header(keyData: Data) -> Data {
        var header: [UInt8] = []
        header.append(0x30)
        let octets = self.encodedOctets(size: keyData.count)
        let totalSize = 15 + 4 + octets.count + keyData.count
        let totalOctets = self.encodedOctets(size: totalSize)
        header.append(contentsOf: totalOctets)
        header.append(contentsOf: [0x02, 0x01, 0x00])
        header.append(contentsOf: SEQIOD)
        header.append(0x04)
        header.append(contentsOf: octets)
        var keyBytes = [UInt8](keyData)
        keyBytes.insert(contentsOf: header, at: 0)
        return Data(bytes: keyBytes, count: keyBytes.count)
    }
    
    static func addSpkiHeader(keyData: Data) -> Data {
        var header: [UInt8] = []
        header.append(0x30)
        let octets = self.encodedOctets(size: keyData.count + 1)
        let totalSize = 15 + 2 + octets.count + keyData.count
        let totalOctets = self.encodedOctets(size: totalSize)
        header.append(contentsOf: totalOctets)
        header.append(contentsOf: SEQIOD)
        header.append(0x03)
        header.append(contentsOf: octets)
        header.append(0x00)
        var keyBytes = [UInt8](keyData)
        keyBytes.insert(contentsOf: header, at: 0)
        return Data(bytes: keyBytes, count: keyBytes.count)
    }
    
    private static func encodedOctets(size: Int) -> [UInt8] {
        if size < 128 {
            return [UInt8(size)]
        }
        let logarithm = self.logarithm(base: 256, value: Float(size))
        var byteCount = Int(ceil(logarithm))
        var size = size
        var result = [UInt8(byteCount + 0x80)]
        while byteCount > 0 {
            result.insert(UInt8(size & 0xFF), at: 1)
            size = size >> 8
            byteCount -= 1
        }
        return result
    }
    
    private static func logarithm(base: Float, value: Float) -> Float {
        return log(value) / log(base)
    }
}
