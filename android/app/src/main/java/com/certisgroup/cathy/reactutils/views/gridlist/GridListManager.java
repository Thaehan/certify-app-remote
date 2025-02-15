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
package com.certisgroup.cathy.reactutils.views.gridlist;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;


import com.certisgroup.cathy.R;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;

import java.util.Map;
import java.util.Objects;

/**
 * View manager for grid list component
 *
 * @author Lingqi
 */
public class GridListManager extends ViewGroupManager<GridList> {

    @NonNull
    @Override
    public String getName() {
        return "GridList";
    }

    @NonNull
    @Override
    protected GridList createViewInstance(@NonNull ThemedReactContext reactContext) {
        LayoutInflater inflater = LayoutInflater.from(reactContext);
        return (GridList) inflater.inflate(R.layout.gridlist, (ViewGroup) null);
    }

    @ReactProp(name = "itemCount")
    public void setItemCount(GridList view, int itemCount) {
        view.setItemCount(itemCount);
    }

    @ReactProp(name = "rowHeight")
    public void setRowHeight(GridList view, float rowHeight) {
        view.setRowHeight(rowHeight);
    }

    @ReactProp(name = "numColumns")
    public void setNumColumns(GridList view, int numColumns) {
        view.setNumColumns(numColumns);
    }

    @ReactProp(name = "dragEnabled")
    public void setDragEnabled(GridList view, boolean dragEnabled) {
        view.setDragEnabled(dragEnabled);
    }

    @ReactProp(name = "verticalSpacing")
    public void setVerticalSpacing(GridList view, float verticalSpacing) {
        view.setVerticalSpacing(verticalSpacing);
    }

    @ReactProp(name = "horizontalSpacing")
    public void setHorizontalSpacing(GridList view, float horizontalSpacing) {
        view.setHorizontalSpacing(horizontalSpacing);
    }

    @ReactProp(name = "paddingInsets")
    public void setPaddingInsets(GridList view, ReadableMap padding) {
        view.setPaddingInsets(padding);
    }

    @ReactProp(name = "clipItem")
    public void setClipItem(GridList view, boolean clipItem) {
        view.setClipChildren(clipItem);
    }

    @Nullable
    @Override
    public Map<String, Object> getExportedCustomDirectEventTypeConstants() {
        return MapBuilder.<String, Object>builder()
            .put(GridList.ON_BIND, MapBuilder.of("registrationName", GridList.ON_BIND))
            .put(GridList.ON_MOVE, MapBuilder.of("registrationName", GridList.ON_MOVE))
            .build();
    }

    @Override
    public void receiveCommand(@NonNull GridList view, String commandId, @Nullable ReadableArray args) {
        switch (commandId) {
            case "refreshDataSet":
                Objects.requireNonNull(view.getAdapter()).notifyDataSetChanged();
                view.scrollBy(0, -1);
                break;
        }
    }

    @Override
    public void addView(GridList parent, View child, int index) {
        parent.addReactChildView(child);
    }
}
