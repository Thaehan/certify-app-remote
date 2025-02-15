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
 * RN module to export build environment
 *
 * @author Lingqi
 */
@objc(BuildVariant)
class BuildVariantModule: NSObject {
    
    @objc
    func constantsToExport() -> [String: Any]! {
        let buildType: String
        #if DEBUG
            buildType = "debug"
        #elseif STAGING
            buildType = "staging"
        #else
            buildType = "release"
        #endif
        return ["buildType": buildType]
    }
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
}
