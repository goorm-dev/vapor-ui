import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { UIEvent } from 'react';

import { Box, Grid } from '@vapor-ui/core';

import IconListItem from './icon-list-item';
import type { IconItem } from './icon-list.constants';

const MIN_COLUMN_WIDTH_PX = 136;
const DEFAULT_ROW_HEIGHT_PX = 124;
const OVERSCAN_ROWS = 3;

type IconGridProps = {
    items: IconItem[];
};

const IconGrid = ({ items }: IconGridProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    const [scrollTop, setScrollTop] = useState(0);
    const [viewportHeight, setViewportHeight] = useState(0);
    const [gridWidth, setGridWidth] = useState(0);
    const [rowGap, setRowGap] = useState(0);
    const [itemHeight, setItemHeight] = useState(DEFAULT_ROW_HEIGHT_PX);

    const setMeasureElement = useCallback((node: HTMLDivElement | null) => {
        if (!node) return;

        const nextHeight = node.getBoundingClientRect().height;
        if (nextHeight <= 0) return;

        setItemHeight((prevHeight) =>
            Math.abs(prevHeight - nextHeight) < 0.5 ? prevHeight : nextHeight,
        );
    }, []);

    useEffect(() => {
        if (!scrollRef.current) return;

        const container = scrollRef.current;
        const updateViewportHeight = () => {
            setViewportHeight(container.clientHeight);
        };

        updateViewportHeight();

        const observer = new ResizeObserver(updateViewportHeight);
        observer.observe(container);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!gridRef.current) return;

        const gridElement = gridRef.current;
        const updateGridMetrics = () => {
            const computedStyle = window.getComputedStyle(gridElement);
            setGridWidth(gridElement.clientWidth);
            setRowGap(Number.parseFloat(computedStyle.rowGap) || 0);
        };

        updateGridMetrics();

        const observer = new ResizeObserver(updateGridMetrics);
        observer.observe(gridElement);

        return () => observer.disconnect();
    }, []);

    const columnCount = useMemo(() => {
        if (gridWidth <= 0) return 1;

        const calculated = Math.floor((gridWidth + rowGap) / (MIN_COLUMN_WIDTH_PX + rowGap));
        return Math.max(1, calculated);
    }, [gridWidth, rowGap]);

    const rowHeight = useMemo(() => {
        return Math.max(DEFAULT_ROW_HEIGHT_PX, itemHeight + rowGap);
    }, [itemHeight, rowGap]);

    const totalRows = useMemo(() => {
        return Math.ceil(items.length / columnCount);
    }, [items.length, columnCount]);

    const visibleRange = useMemo(() => {
        if (items.length === 0) {
            return {
                startIndex: 0,
                endIndexExclusive: 0,
                topSpacerHeight: 0,
                bottomSpacerHeight: 0,
            };
        }

        const visibleStartRow = Math.floor(scrollTop / rowHeight);
        const visibleEndRow = Math.ceil((scrollTop + viewportHeight) / rowHeight) - 1;
        const maxRowIndex = Math.max(0, totalRows - 1);

        const startRow = Math.min(maxRowIndex, Math.max(0, visibleStartRow - OVERSCAN_ROWS));
        const endRow = Math.min(maxRowIndex, Math.max(startRow, visibleEndRow + OVERSCAN_ROWS));

        const startIndex = startRow * columnCount;
        const endIndexExclusive = Math.min(items.length, (endRow + 1) * columnCount);
        const renderedRows = Math.ceil((endIndexExclusive - startIndex) / columnCount);

        const topSpacerHeight = startRow * rowHeight;
        const bottomSpacerHeight = Math.max(
            0,
            totalRows * rowHeight - topSpacerHeight - renderedRows * rowHeight,
        );

        return { startIndex, endIndexExclusive, topSpacerHeight, bottomSpacerHeight };
    }, [columnCount, items.length, rowHeight, scrollTop, totalRows, viewportHeight]);

    const visibleItems = useMemo(() => {
        return items.slice(visibleRange.startIndex, visibleRange.endIndexExclusive);
    }, [items, visibleRange.endIndexExclusive, visibleRange.startIndex]);

    const handleScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
        setScrollTop(event.currentTarget.scrollTop);
    }, []);

    return (
        <Box
            ref={scrollRef}
            onScroll={handleScroll}
            $css={{
                maxHeight: '32rem',
                overflowY: 'auto',
                padding: '$100',
                borderRadius: '$400',
                backgroundColor: '$bg-secondary-100',
                border: '1px solid $border-normal',
            }}
        >
            <Grid.Root
                ref={gridRef}
                render={<ul />}
                aria-label="아이콘 목록"
                templateColumns="repeat(auto-fill, minmax(8.5rem, 1fr))"
                $css={{
                    gap: '$150',
                    listStyle: 'none',
                    margin: 0,
                    padding: '$200',
                }}
            >
                {visibleRange.topSpacerHeight > 0 ? (
                    <Box
                        render={<li />}
                        aria-hidden="true"
                        style={{
                            height: `${visibleRange.topSpacerHeight}px`,
                            gridColumn: '1 / -1',
                        }}
                    />
                ) : null}

                {visibleItems.map(({ name, icon }, index) => (
                    <Box
                        render={<li />}
                        key={name}
                        ref={index === 0 ? setMeasureElement : undefined}
                    >
                        <IconListItem icon={icon} iconName={name} />
                    </Box>
                ))}

                {visibleRange.bottomSpacerHeight > 0 ? (
                    <Box
                        render={<li />}
                        aria-hidden="true"
                        style={{
                            height: `${visibleRange.bottomSpacerHeight}px`,
                            gridColumn: '1 / -1',
                        }}
                    />
                ) : null}
            </Grid.Root>
        </Box>
    );
};

export default IconGrid;
