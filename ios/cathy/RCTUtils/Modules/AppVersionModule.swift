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
import Foundation

/**
 * RN module to export app version
 *
 * @author Lingqi
 */
@objc(AppVersion)
class AppVersionModule: NSObject {
    
    @objc
    func constantsToExport() -> [String: Any]! {
        let bundle = Bundle.main
        let versionName = bundle.object(forInfoDictionaryKey: "CFBundleShortVersionString")!
        let versionCode = bundle.object(forInfoDictionaryKey: kCFBundleVersionKey as String)!
        return ["versionName": versionName,
                "versionCode": versionCode]
    }
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
}
