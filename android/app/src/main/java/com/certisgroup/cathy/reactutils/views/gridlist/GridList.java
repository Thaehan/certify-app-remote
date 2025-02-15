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

import android.content.Context;
import android.graphics.Rect;
import android.util.AttributeSet;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.ItemTouchHelper;
import androidx.recyclerview.widget.RecyclerView;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.events.RCTEventEmitter;

import java.util.ArrayList;
import java.util.List;

/**
 * RN component of grid list view
 *
 * @author Lingqi
 */
public class GridList extends RecyclerView {

    static final String ON_BIND = "onBindItem";
    static final String ON_MOVE = "onMoveItem";
    private final GridLayoutManager layoutManager;
    private final GridAdapter adapter;
    private final GridDragAdapter dragAdapter;
    private final ItemTouchHelper touchHelper;
    private final SpacingDecoration spacingDecoration;
    private float scale;

    public GridList(@NonNull Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        this.setHasFixedSize(true);
        layoutManager = new GridLayoutManager(context, 1);
        this.setLayoutManager(layoutManager);
        adapter = new GridAdapter();
        this.setAdapter(adapter);
        dragAdapter = new GridDragAdapter();
        touchHelper = new ItemTouchHelper(dragAdapter);
        touchHelper.attachToRecyclerView(this);
        spacingDecoration = new SpacingDecoration();
        this.addItemDecoration(spacingDecoration);
        this.setClipToPadding(false);
        this.setScrollBarStyle(SCROLLBARS_OUTSIDE_OVERLAY);
        scale = this.getResources().getDisplayMetrics().density;
        this.setRowHeight(56.0f);
        setHorizontalSpacing(16.0f);
    }

    void setItemCount(int itemCount) {
        adapter.itemCount = itemCount;
    }

    void setRowHeight(float rowHeight) {
        adapter.rowHeight = (int) (rowHeight * scale + 0.5f);
    }

    void setNumColumns(int numColumns) {
        layoutManager.setSpanCount(numColumns);
        spacingDecoration.numColumns = numColumns;
    }

    void setDragEnabled(boolean dragEnabled) {
        dragAdapter.dragEnabled = dragEnabled;
    }

    void setVerticalSpacing(float verticalSpacing) {
        spacingDecoration.verticalSpacing = (int) (verticalSpacing * scale + 0.5f);
    }

    void setHorizontalSpacing(float horizontalSpacing) {
        spacingDecoration.horizontalSpacing = (int) (horizontalSpacing * scale + 0.5f);
    }

    void setPaddingInsets(ReadableMap padding) {
        this.setPadding(
            (int) (padding.getDouble("left") * scale + 0.5f),
            (int) (padding.getDouble("top") * scale + 0.5f),
            (int) (padding.getDouble("right") * scale + 0.5f),
            (int) (padding.getDouble("bottom") * scale + 0.5f)
        );
    }

    void addReactChildView(View child) {
        adapter.addItemView(child);
    }

    private RCTEventEmitter getEventEmitter() {
        return ((ReactContext) getContext()).getJSModule(RCTEventEmitter.class);
    }

    @Override
    public boolean isLayoutRequested() {
        return false;
    }

    //**************************************************************
    // Implement ViewHolder
    //****************************************************************

    private static class GridViewHolder extends RecyclerView.ViewHolder {

        GridViewHolder(@NonNull View itemView) {
            super(itemView);
        }
    }

    //**************************************************************
    // Implement Adapter for data binding
    //****************************************************************

    private static class GridAdapter extends RecyclerView.Adapter<GridViewHolder> {

        private GridList gridList;
        private final List<View> itemViews;
        int rowHeight;
        int itemCount;

        GridAdapter() {
            super();
            itemViews = new ArrayList<>();
            itemCount = 0;
        }

        @Override
        public void onAttachedToRecyclerView(@NonNull RecyclerView recyclerView) {
            gridList = (GridList) recyclerView;
        }

        @NonNull
        @Override
        public GridViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            int index = itemViews.size() - 1;
            View view = itemViews.get(index);
            view.setTag(index);
            view.setLayoutParams(new LayoutParams(LayoutParams.MATCH_PARENT, rowHeight));
            itemViews.remove(index);
            return new GridViewHolder(view);
        }

        @Override
        public void onBindViewHolder(@NonNull GridViewHolder viewHolder, int position) {
            int index = (Integer) viewHolder.itemView.getTag();
            WritableMap event = Arguments.createMap();
            event.putInt("index", index);
            event.putInt("position", position);
            gridList.getEventEmitter().receiveEvent(gridList.getId(), GridList.ON_BIND, event);
        }

        @Override
        public int getItemCount() {
            return itemCount;
        }

        void addItemView(View child) {
            itemViews.add(child);
        }
    }

    //**************************************************************
    // Implement Adapter for drag actions
    //****************************************************************

    private static class GridDragAdapter extends ItemTouchHelper.SimpleCallback {

        boolean dragEnabled;

        GridDragAdapter() {
            super(ItemTouchHelper.UP | ItemTouchHelper.DOWN
                | ItemTouchHelper.LEFT | ItemTouchHelper.RIGHT, 0);
            dragEnabled = false;
        }

        @Override
        public boolean onMove(@NonNull RecyclerView recyclerView, @NonNull ViewHolder viewHolder, @NonNull ViewHolder target) {
            GridList gridList = (GridList) recyclerView;
            int fromPosition = viewHolder.getAdapterPosition();
            int toPosition = target.getAdapterPosition();
            gridList.adapter.notifyItemMoved(fromPosition, toPosition);
            WritableMap event = Arguments.createMap();
            event.putInt("fromPosition", fromPosition);
            event.putInt("toPosition", toPosition);
            gridList.getEventEmitter().receiveEvent(gridList.getId(), GridList.ON_MOVE, event);
            return true;
        }

        @Override
        public void onSwiped(@NonNull ViewHolder viewHolder, int direction) { }

        @Override
        public int getDragDirs(@NonNull RecyclerView recyclerView, @NonNull ViewHolder viewHolder) {
            return dragEnabled ? super.getDragDirs(recyclerView, viewHolder) : 0;
        }
    }

    //**************************************************************
    // Implement decoration for layout spacing
    //****************************************************************

    private static class SpacingDecoration extends RecyclerView.ItemDecoration {

        int numColumns;
        int verticalSpacing;
        int horizontalSpacing;

        SpacingDecoration() {
            numColumns = 1;
            verticalSpacing = 0;
            horizontalSpacing = 0;
        }

        @Override
        public void getItemOffsets(@NonNull Rect outRect, @NonNull View view, @NonNull RecyclerView parent, @NonNull State state) {
            super.getItemOffsets(outRect, view, parent, state);
            int position = parent.getChildAdapterPosition(view);
            int columnIndex = position % numColumns;
            outRect.left = Math.round(horizontalSpacing * (columnIndex * 1.0f / numColumns));
            outRect.right = Math.round(horizontalSpacing * (1 - (columnIndex + 1) * 1.0f / numColumns));
            if (position >= numColumns) {
                outRect.top = verticalSpacing;
            }
        }
    }
}
