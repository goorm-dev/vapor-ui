'use client';

import type { CSSProperties } from 'react';
import { forwardRef } from 'react';

import { assignInlineVars } from '@vanilla-extract/dynamic';

import { cn } from '~/utils/cn';
import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import { Box } from '../box';
import type { RootVariants } from './grid.css';
import * as styles from './grid.css';

/* -------------------------------------------------------------------------------------------------
 * Grid
 * -----------------------------------------------------------------------------------------------*/

type GridVariants = RootVariants & {
    /**
     * Row tracks of the grid, set as the `grid-template-rows` value, such as `auto 1fr` or `repeat(3, 1fr)`.
     */
    templateRows?: string;
    /**
     * Column tracks of the grid, set as the `grid-template-columns` value, such as `200px 1fr` or `repeat(3, 1fr)`.
     */
    templateColumns?: string;
    /**
     * Direction in which items without an explicit position are placed, set as the `grid-auto-flow` value. The `-dense` values fill earlier gaps with later items.
     */
    flow?: CSSProperties['gridAutoFlow'];
};

/**
 * Root of the Grid compound component, a container that lays out its children in rows and columns with CSS grid. Renders a `<div>` element.
 */
export const GridRoot = forwardRef<HTMLDivElement, GridRoot.Props>((props, ref) => {
    const { className, style, ...componentProps } = resolveStyles(props);
    const [variantProps, otherProps] = createSplitProps<GridVariants>()(componentProps, [
        'inline',
        'templateRows',
        'templateColumns',
        'flow',
    ]);

    const { templateRows, templateColumns, ...variants } = variantProps;

    const cssVariables = assignInlineVars({
        [styles.gridTemplateRows]: templateRows,
        [styles.gridTemplateColumns]: templateColumns,
    });

    return (
        <Box
            ref={ref}
            style={{ ...cssVariables, ...style }}
            className={cn(styles.root(variants), className)}
            {...otherProps}
        />
    );
});
GridRoot.displayName = 'Grid';

/* -------------------------------------------------------------------------------------------------
 * Grid.Item
 * -----------------------------------------------------------------------------------------------*/

/**
 * Item inside `Grid.Root` that can be placed across or span several rows and columns. Renders a `<div>` element.
 */
export const GridItem = forwardRef<HTMLDivElement, GridItem.Props>((props, ref) => {
    const { rowSpan, colSpan, className, style, ...componentProps } = resolveStyles(props);

    const cssVariables = assignInlineVars({
        [styles.gridItemRowSpan]: rowSpan,
        [styles.gridItemColSpan]: colSpan,
    });

    return (
        <Box
            ref={ref}
            style={{ ...cssVariables, ...style }}
            className={cn(styles.item, className)}
            {...componentProps}
        />
    );
});
GridItem.displayName = 'Grid.Item';

/* -----------------------------------------------------------------------------------------------*/

export namespace GridRoot {
    export type State = {};
    export type Props = VaporUIComponentProps<typeof Box, State> & GridVariants;
}

export namespace GridItem {
    type GridItemVariants = {
        /**
         * Rows the item occupies, set as the `grid-row` value, such as `span 2` or `1 / 3`.
         */
        rowSpan?: string;
        /**
         * Columns the item occupies, set as the `grid-column` value, such as `span 2` or `1 / 3`.
         */
        colSpan?: string;
    };

    export type State = {};
    export type Props = VaporUIComponentProps<typeof Box, State> & GridItemVariants;
}
