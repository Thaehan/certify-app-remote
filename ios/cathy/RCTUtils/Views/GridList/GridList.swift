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
 * RN component of Grid List View
 *
 * @author Lingqi
 */
@objc(GridListNative)
class GridList: UICollectionView {
    
    @objc var onBindItem: RCTDirectEventBlock!
    @objc var onMoveItem: RCTDirectEventBlock!
    
    private let layoutManager: UICollectionViewFlowLayout
    private let dataAdapter: GridDataAdapter
    private let spacingDelegate: SpacingDelegate
    private let longPressListener: UILongPressGestureRecognizer
    let screenWidth: CGFloat
    
    init() {
        layoutManager = UICollectionViewFlowLayout()
        dataAdapter = GridDataAdapter()
        spacingDelegate = SpacingDelegate()
        screenWidth = UIScreen.main.bounds.width
        longPressListener = UILongPressGestureRecognizer()
        super.init(frame: CGRect.zero, collectionViewLayout: layoutManager)
        self.dataSource = dataAdapter
        self.delegate = spacingDelegate
        self.register(GridViewHolder.self, forCellWithReuseIdentifier: GridViewHolder.ID)
        longPressListener.addTarget(self, action: #selector(onLongPress(gesture:)))
        self.addGestureRecognizer(longPressListener)
        self.backgroundColor = UIColor.white
        self.bounces = false;
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    func setItemCount(_ itemCount: Int) {
        dataAdapter.itemCount = itemCount
    }
    
    func setRowHeight(_ rowHeight: CGFloat) {
        spacingDelegate.rowHeight = rowHeight
        layoutManager.itemSize.height = rowHeight
    }
    
    func setNumColumns(_ numColumns: Int) {
        spacingDelegate.numColumns = numColumns
    }
    
    func setDragEnabled(_ dragEnabled: Bool) {
        dataAdapter.dragEnabled = dragEnabled
    }
    
    func setVerticalSpacing(_ verticalSpacing: CGFloat) {
        spacingDelegate.verticalSpacing = verticalSpacing
    }
    
    func setHorizontalSpacing(_ horizontalSpacing: CGFloat) {
        spacingDelegate.horizontalSpacing = horizontalSpacing
    }
    
    func setPaddingInsets(_ padding: [String: CGFloat]) {
        spacingDelegate.padding = UIEdgeInsets(top: padding["top"]!,
                                               left: padding["left"]!,
                                               bottom: padding["bottom"]!,
                                               right: padding["right"]!)
    }
    
    func setClipItem(_ clipItem: Bool) {
        dataAdapter.clipItem = clipItem
    }
    
    override func insertReactSubview(_ subview: UIView!, at atIndex: Int) {
        dataAdapter.addItemView(subview)
    }
    
    @objc
    private func onLongPress(gesture: UIGestureRecognizer) {
        let point = gesture.location(in: self)
        switch gesture.state {
            case .began:
                if let indexPath = self.indexPathForItem(at: point) {
                    self.beginInteractiveMovementForItem(at: indexPath)
                }
            case .changed:
                self.updateInteractiveMovementTargetPosition(point)
            case .ended:
                self.endInteractiveMovement()
            default:
                self.cancelInteractiveMovement()
        }
    }
}

// MARK: - Implement ViewHolder

private class GridViewHolder: UICollectionViewCell {
    
    static let ID = "GridViewHolder"
    private(set) var itemView: UIView!
    
    func onCreate(itemView: UIView) {
        self.itemView = itemView
        self.contentView.subviews.forEach({ $0.removeFromSuperview() })
        self.contentView.addSubview(itemView)
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        itemView.frame = self.bounds
    }
}

// MARK: - Implement Adapter for data binding and drag actions

private class GridDataAdapter: NSObject, UICollectionViewDataSource {
    
    private var itemViews: [UIView]
    var itemCount: Int
    var dragEnabled: Bool
    var clipItem: Bool
    
    override init() {
        itemViews = []
        itemCount = 0
        dragEnabled = false
        clipItem = true
        super.init()
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let holder = collectionView.dequeueReusableCell(withReuseIdentifier: GridViewHolder.ID, for: indexPath) as! GridViewHolder
        if holder.itemView == nil {
            let index = itemViews.count - 1
            let view = itemViews[index]
            view.tag = index
            itemViews.remove(at: index)
            holder.onCreate(itemView: view)
        }
        holder.contentView.clipsToBounds = clipItem
        let gridList = collectionView as! GridList
        let index = holder.itemView.tag
        let event = [
            "index": index,
            "position": indexPath.item
        ]
        gridList.onBindItem(event)
        return holder
    }
    
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return itemCount
    }
    
    func collectionView(_ collectionView: UICollectionView, moveItemAt sourceIndexPath: IndexPath, to destinationIndexPath: IndexPath) {
        let gridList = collectionView as! GridList
        let event = [
            "fromPosition": sourceIndexPath.item,
            "toPosition": destinationIndexPath.item,
        ]
        gridList.onMoveItem(event)
    }
    
    func collectionView(_ collectionView: UICollectionView, canMoveItemAt indexPath: IndexPath) -> Bool {
        return dragEnabled
    }
    
    func addItemView(_ child: UIView) {
        itemViews.append(child)
    }
}

// MARK: - Implement delegate for layout spacing

private class SpacingDelegate: NSObject, UICollectionViewDelegateFlowLayout {
    
    var rowHeight: CGFloat
    var numColumns: Int
    var verticalSpacing: CGFloat
    var horizontalSpacing: CGFloat
    var padding: UIEdgeInsets
    
    override init() {
        rowHeight = 0
        numColumns = 1
        verticalSpacing = 0
        horizontalSpacing = 0
        padding = UIEdgeInsets.zero
        super.init()
    }
    
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
        let gridList = collectionView as! GridList
        let columnWidth = (gridList.screenWidth - horizontalSpacing * CGFloat(numColumns - 1) - padding.left - padding.right) / CGFloat(numColumns)
        return CGSize(width: columnWidth, height: rowHeight)
    }
    
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, minimumLineSpacingForSectionAt section: Int) -> CGFloat {
        return verticalSpacing
    }
    
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, minimumInteritemSpacingForSectionAt section: Int) -> CGFloat {
        return horizontalSpacing
    }
    
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, insetForSectionAt section: Int) -> UIEdgeInsets {
        return padding
    }
}
