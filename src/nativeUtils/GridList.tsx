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
import React, {
    PureComponent,
    ReactElement,
} from 'react';
import {
    StyleProp,
    ViewStyle,
    Dimensions,
    StyleSheet,
    requireNativeComponent,
    NativeSyntheticEvent,
    UIManager,
    findNodeHandle,
} from 'react-native';

interface Props<ItemT> {
    style: StyleProp<ViewStyle>;
    listHeight: number;
    rowHeight: number;
    numColumns: number;
    dragEnabled: boolean;
    verticalSpacing: number;
    horizontalSpacing: number;
    clipItem: boolean;
    dataSet: ItemT[];
    renderItem: (itemInfo: ListItemInfo<ItemT>) => ReactElement;
    onMoveItem: (from: number, to: number) => void;
}
interface State {
    positions: number[];
}

/**
 * Native Grid List View, Android RecyclerView, iOS UICollectionView
 *
 * @author Lingqi
 */
export class GridList<ItemT> extends PureComponent<Props<ItemT>, State> {

    static defaultProps = {
        style: { flex: 1 },
        listHeight: undefined,
        numColumns: 1,
        dragEnabled: false,
        verticalSpacing: 0,
        horizontalSpacing: 0,
        clipItem: true,
        onMoveItem: () => { }
    };

    private padding: Padding;
    private getIndexByPosition: { [key: number]: number };

    constructor(props: Props<ItemT>) {
        super(props);
        const flattenedStyle = StyleSheet.flatten(props.style);
        const listHeight = props.listHeight
            || flattenedStyle.height
            || Dimensions.get('window').height;
        const rowHeight = props.rowHeight + props.verticalSpacing;
        const childNum = Math.ceil((listHeight as number) / rowHeight) * props.numColumns + (3 + props.numColumns * 2);
        const positions = [];
        for (let i = 0; i < childNum; i++) {
            positions.push(-1);
        }
        this.state = {
            positions
        };
        this.padding = { top: 0, right: 0, bottom: 0, left: 0 };
        this.getIndexByPosition = {};
        this.onBindItem = this.onBindItem.bind(this);
        this.onMoveItem = this.onMoveItem.bind(this);
        calculatePadding(this.padding, flattenedStyle);
    }

    componentDidUpdate(prevProps: Props<ItemT>, prevState: State) {
        if (prevProps.dataSet !== this.props.dataSet) {
            this.refreshDataSet();
        }
    }

    private onBindItem(event: NativeSyntheticEvent<BindEvent>): void {
        const { index, position } = event.nativeEvent;
        const positions = [...this.state.positions];
        const originalPosition = positions[index];
        delete this.getIndexByPosition[originalPosition];
        positions[index] = position;
        this.getIndexByPosition[position] = index;
        this.setState({ positions });
    }

    private onMoveItem(event: NativeSyntheticEvent<MoveEvent>): void {
        const { fromPosition, toPosition } = event.nativeEvent;
        const positions = [...this.state.positions];
        if (fromPosition < toPosition) {
            for (let i = toPosition; i > fromPosition; i--) {
                const index = this.getIndexByPosition[i];
                positions[index] = positions[index] - 1;
            }
        } else {
            for (let i = toPosition; i < fromPosition; i++) {
                const index = this.getIndexByPosition[i];
                positions[index] = positions[index] + 1;
            }
        }
        const fromIndex = this.getIndexByPosition[fromPosition];
        positions[fromIndex] = toPosition;
        this.setState({ positions });
        this.props.onMoveItem(fromPosition, toPosition);
    }

    private refreshDataSet(): void {
        UIManager.dispatchViewManagerCommand(
            findNodeHandle(this),
            'refreshDataSet' as any,
            undefined
        );
    }

    render() {
        const { dataSet } = this.props;
        return (
            <NativeGridList
                style={this.props.style}
                itemCount={dataSet.length}
                rowHeight={this.props.rowHeight}
                numColumns={this.props.numColumns}
                dragEnabled={this.props.dragEnabled}
                verticalSpacing={this.props.verticalSpacing}
                horizontalSpacing={this.props.horizontalSpacing}
                paddingInsets={this.padding}
                clipItem={this.props.clipItem}
                onBindItem={this.onBindItem}
                onMoveItem={this.onMoveItem}>
                {this.state.positions.map((position, index) => {
                    return (
                        <GridListItem
                            key={index}
                            index={index}
                            position={position}
                            item={position >= 0 ? dataSet[position] : undefined}
                            render={this.props.renderItem} />
                    );
                })}
            </NativeGridList>
        );
    }
}

interface ItemProps<ItemT> {
    position: number;
    index: number;
    item?: ItemT;
    render: (itemInfo: ListItemInfo<ItemT>) => ReactElement;
}

/**
 * An item within Grid List View
 *
 * @author Lingqi
 */
class GridListItem<ItemT> extends PureComponent<ItemProps<ItemT>> {
    render() {
        const { position, item } = this.props;
        return this.props.render({ position, item });
    }
}

const NativeGridList = requireNativeComponent('GridList');

export interface ListItemInfo<ItemT> {
    position: number;
    item?: ItemT;
}
interface BindEvent {
    index: number;
    position: number;
}
interface MoveEvent {
    fromPosition: number;
    toPosition: number;
    fromIndex: number;
    toIndex: number;
}
interface Padding {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

function calculatePadding(padding: Padding, style: ViewStyle) {
    padding.top = (style.paddingTop || style.paddingVertical || style.padding || padding.top) as number;
    padding.right = (style.paddingRight || style.paddingHorizontal || style.padding || padding.right) as number;
    padding.bottom = (style.paddingBottom || style.paddingVertical || style.padding || padding.bottom) as number;
    padding.left = (style.paddingLeft || style.paddingHorizontal || style.padding || padding.left) as number;
}
