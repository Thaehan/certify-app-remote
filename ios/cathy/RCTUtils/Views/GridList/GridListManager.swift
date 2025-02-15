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
import UIKit

/**
 * View manager for grid list component
 *
 * @author Lingqi
 */
@objc(GridList)
class GridListManager: RCTViewManager {
    
    override func view() -> UIView! {
        return GridList()
    }
    
    @objc(set_itemCount::)
    func setItemCount(_ itemCount: Int, view: GridList) {
        view.setItemCount(itemCount)
    }
    
    @objc(set_rowHeight::)
    func setRowHeight(_ rowHeight: CGFloat, view: GridList) {
        view.setRowHeight(rowHeight)
    }
    
    @objc(set_numColumns::)
    func setNumColumns(_ numColumns: Int, view: GridList) {
        view.setNumColumns(numColumns)
    }
    
    @objc(set_dragEnabled::)
    func setDragEnabled(_ dragEnabled: Bool, view: GridList) {
        view.setDragEnabled(dragEnabled)
    }
    
    @objc(set_verticalSpacing::)
    func setVerticalSpacing(_ verticalSpacing: CGFloat, view: GridList) {
        view.setVerticalSpacing(verticalSpacing)
    }
    
    @objc(set_horizontalSpacing::)
    func setHorizontalSpacing(_ horizontalSpacing: CGFloat, view: GridList) {
        view.setHorizontalSpacing(horizontalSpacing)
    }
    
    @objc(set_paddingInsets::)
    func setPaddingInsets(_ padding: [String: CGFloat], view: GridList) {
        view.setPaddingInsets(padding)
    }
    
    @objc(set_clipItem::)
    func setClipItem(_ clipItem: Bool, view: GridList) {
        view.setClipItem(clipItem)
    }
    
    @objc
    static func propConfig_onBindItem() -> [String] {
        return ["RCTDirectEventBlock"]
    }
    
    @objc
    static func propConfig_onMoveItem() -> [String] {
        return ["RCTDirectEventBlock"]
    }
    
    @objc(refreshDataSet:)
    func refreshDataSet(reactTag: NSNumber) {
        self.bridge.uiManager.addUIBlock({ (uiManager, viewRegistry) in
            if let view = viewRegistry?[reactTag] {
                let view = view as! GridList
                view.reloadData()
            }
        })
    }
    
    override static func requiresMainQueueSetup() -> Bool {
        return false
    }
}
