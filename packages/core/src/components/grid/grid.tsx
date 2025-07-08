'use client';

import type { CSSProperties, ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import { assignInlineVars } from '@vanilla-extract/dynamic';
import clsx from 'clsx';

import { createSplitProps } from '~/utils/create-split-props';

import { Box } from '../box';
import type { RootVariants } from './grid.css';
import * as styles from './grid.css';

/* -------------------------------------------------------------------------------------------------
 * Grid
 * -----------------------------------------------------------------------------------------------*/

type GridPrimitiveProps = ComponentPropsWithoutRef<typeof Box>;
type GridVariants = RootVariants & {
    inline?: boolean;
    templateRows?: string;
    templateColumns?: string;
    flow?: CSSProperties['gridAutoFlow'];
};

interface GridRootProps extends GridPrimitiveProps, GridVariants {}

const Root = forwardRef<HTMLDivElement, GridRootProps>(
    ({ className, style, children, ...props }, ref) => {
        const [gridRootProps, otherProps] = createSplitProps<GridVariants>()(props, [
            'inline',
            'templateRows',
            'templateColumns',
            'flow',
        ]);

        const { inline, templateRows, templateColumns, ...variants } = gridRootProps;

        const cssVariables = assignInlineVars({
            [styles.gridTemplateRows]: templateRows,
            [styles.gridTemplateColumns]: templateColumns,
        });

        return (
            <Box
                ref={ref}
                style={{ display: inline ? 'inline-grid' : 'grid', ...cssVariables, ...style }}
                className={clsx(styles.root(variants), className)}
                {...otherProps}
            >
                {children}
            </Box>
        );
    },
);
Root.displayName = 'Grid';

/* -------------------------------------------------------------------------------------------------
 * Grid.Item
 * -----------------------------------------------------------------------------------------------*/

type GridItemPrimitiveProps = ComponentPropsWithoutRef<typeof Box>;
type GridItemVariants = { rowSpan?: string; colSpan?: string };

interface GridItemProps extends GridItemPrimitiveProps, GridItemVariants {}

const Item = forwardRef<HTMLDivElement, GridItemProps>(
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
Item.displayName = 'Grid.Item';

/* -----------------------------------------------------------------------------------------------*/

export { Root as GridRoot, Item as GridItem };
export type { GridRootProps, GridItemProps };

export const Grid = { Root, Item };
