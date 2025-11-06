'use client';

import type { CSSProperties } from 'react';
import { forwardRef } from 'react';

import { assignInlineVars } from '@vanilla-extract/dynamic';
import clsx from 'clsx';

import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import { Box } from '../box';
import type { RootVariants } from './grid.css';
import * as styles from './grid.css';

/* -------------------------------------------------------------------------------------------------
 * Grid
 * -----------------------------------------------------------------------------------------------*/

type GridVariants = RootVariants & {
    inline?: boolean;
    templateRows?: string;
    templateColumns?: string;
    flow?: CSSProperties['gridAutoFlow'];
};

export const GridRoot = forwardRef<HTMLDivElement, GridRoot.Props>(
    ({ className, style, children, ...props }, ref) => {
        const [variantProps, otherProps] = createSplitProps<GridVariants>()(props, [
            'inline',
            'templateRows',
            'templateColumns',
            'flow',
        ]);

        const { inline, templateRows, templateColumns, ...variants } = variantProps;

        const cssVariables = assignInlineVars({
            [styles.gridTemplateRows]: templateRows,
            [styles.gridTemplateColumns]: templateColumns,
        });

        return (
            <Box
                ref={ref}
                display={inline ? 'inline-grid' : 'grid'}
                style={{ ...cssVariables, ...style }}
                className={clsx(styles.root(variants), className)}
                {...otherProps}
            >
                {children}
            </Box>
        );
    },
);
GridRoot.displayName = 'Grid';

/* -------------------------------------------------------------------------------------------------
 * Grid.Item
 * -----------------------------------------------------------------------------------------------*/

export const GridItem = forwardRef<HTMLDivElement, GridItem.Props>(
    ({ rowSpan, colSpan, className, style, children, ...props }, ref) => {
        const cssVariables = assignInlineVars({
            [styles.gridItemRowSpan]: rowSpan,
            [styles.gridItemColSpan]: colSpan,
        });

        return (
            <Box
                ref={ref}
                style={{ ...cssVariables, ...style }}
                className={clsx(styles.item, className)}
                {...props}
            >
                {children}
            </Box>
        );
    },
);
GridItem.displayName = 'Grid.Item';

/* -----------------------------------------------------------------------------------------------*/

export namespace GridRoot {
    type GridPrimitiveProps = VComponentProps<typeof Box>;

    export interface Props extends GridPrimitiveProps, GridVariants {}
}

export namespace GridItem {
    type GridItemPrimitiveProps = VComponentProps<typeof Box>;
    type GridItemVariants = { rowSpan?: string; colSpan?: string };

    export interface Props extends GridItemPrimitiveProps, GridItemVariants {}
}
