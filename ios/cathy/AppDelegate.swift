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
import AppCenter
import AppCenterDistribute
/**
 * Application delegate
 *
 * @author Lingqi
 */
@UIApplicationMain
class AppDelegate: UIResponder,
        UIApplicationDelegate, RCTBridgeDelegate {
    
    var window: UIWindow?
    private(set) var reactBridge: RCTBridge!
    
    // MARK: - UIApplicationDelegate
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
        UIApplication.initClass
        self.initAppUpdate()
        self.setupSDWebImage()
        reactBridge = RCTBridge(delegate: self,
                                launchOptions: launchOptions)
        window = UIWindow(frame: UIScreen.main.bounds)
        window?.addSubview(self.getWindowBackground())
        window?.rootViewController = MainViewController()
        window?.makeKeyAndVisible()
        return true
    }
    
    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }
    
    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }
    
    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }
    
    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }
    
    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }
    
    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
        return RCTLinkingManager.application(app,
                                             open: url,
                                             options: options)
    }
    
    // MARK: - RCTBridgeDelegate
    
    func sourceURL(for bridge: RCTBridge!) -> URL! {
        #if DEBUG
        return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
        #else
            return Bundle.main.url(forResource: "main",
                                   withExtension: "jsbundle")
        #endif
    }
    
    // MARK: - Other Configs
    
    private func getWindowBackground() -> UIView {
        let launchScreenViews = Bundle.main.loadNibNamed("LaunchScreen",
                                                         owner: nil,
                                                         options: nil)
        let windowBackground = launchScreenViews?.first as! UIView
        windowBackground.frame = UIScreen.main.bounds
        return windowBackground
    }
    
    private func initAppUpdate() {
        #if !DEBUG
            let urlTypes = Bundle.main.object(forInfoDictionaryKey: "CFBundleURLTypes") as! [[String: Any]]
            let urlSchemes = urlTypes[0]["CFBundleURLSchemes"] as! [String]
            let appSecret = String(urlSchemes[1].dropFirst(10))
            MSAppCenter.start(appSecret, withServices: [MSDistribute.self])
        #endif
    }
    
    private func setupSDWebImage() {
//        SDImageCache.shared().config.maxCacheSize = 250 * 1024 * 1024
//        SDImageCache.shared().config.maxCacheAge = 60 * 60 * 24 * 365
//        SDImageCache.shared().maxMemoryCost = UInt(CGFloat(ProcessInfo.processInfo.physicalMemory) * 0.33)
        SDImageCache.shared.config.maxDiskSize = 250 * 1024 * 1024
        SDImageCache.shared.config.maxDiskAge = 60 * 60 * 24 * 365
        SDImageCache.shared.config.maxMemoryCost = UInt(CGFloat(ProcessInfo.processInfo.physicalMemory) * 0.33)
    }
}


// MARK: - Fix Font Scale

extension UIApplication {

    static let initClass: Void = {
        method_exchangeImplementations(
            class_getInstanceMethod(UIApplication.self, #selector(getter: fixedPreferredContentSizeCategory))!,
            class_getInstanceMethod(UIApplication.self, #selector(getter: preferredContentSizeCategory))!
        )
    }()

    @objc
    var fixedPreferredContentSizeCategory: UIContentSizeCategory {
        return .large
    }
}
