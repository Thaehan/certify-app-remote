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
import UIKit
import AppCenterDistribute

/**
 * Main ViewController to host RCTRootView
 *
 * @author Lingqi
 */
class MainViewController: UIViewController {
    
    private var reactRootView: RCTRootView!
    private var reactBridge: RCTBridge!
    
    // MARK: - UIViewController Overrides
    
    override func loadView() {
        reactBridge = (UIApplication.shared.delegate as! AppDelegate).reactBridge
        reactRootView = RCTRootView(bridge: reactBridge,
                                    moduleName: "Cathy",
                                    initialProperties: getInitialProperties())
        reactRootView.backgroundColor = UIColor.clear
        self.view = reactRootView
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        #if !DEBUG
            MSDistribute.checkForUpdate()
        #endif
    }
    
    // MARK: - Config React Native
    
    private func getInitialProperties() -> [AnyHashable : Any]! {
        return nil
    }
}
