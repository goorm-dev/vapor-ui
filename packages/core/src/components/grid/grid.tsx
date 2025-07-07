'use client';

import { type CSSProperties, type ComponentPropsWithoutRef, forwardRef } from 'react';

import { assignInlineVars } from '@vanilla-extract/dynamic';
import clsx from 'clsx';

import { vapor } from '~/libs/factory';
import type { MergeRecipeVariants } from '~/libs/recipe';
import { type Sprinkles, sprinkles } from '~/styles/sprinkles.css';
import { createSplitProps } from '~/utils/create-split-props';
import { splitLayoutProps } from '~/utils/split-layout-props';

import * as styles from './grid.css';

/* -------------------------------------------------------------------------------------------------
 * Grid
 * -----------------------------------------------------------------------------------------------*/

type GridPrimitiveProps = ComponentPropsWithoutRef<typeof vapor.div>;
type GridVariants = MergeRecipeVariants<typeof styles.root> & {
    inline?: boolean;
    templateRows?: string;
    templateColumns?: string;
    flow?: CSSProperties['gridAutoFlow'];
};

interface GridRootProps extends GridPrimitiveProps, GridVariants, Sprinkles {}

const Root = forwardRef<HTMLDivElement, GridRootProps>(
    ({ className, style, children, ...props }, ref) => {
        const [layoutProps, gridProps] = splitLayoutProps(props);
        const [gridRootProps, otherProps] = createSplitProps<GridVariants>()(gridProps, [
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
            <vapor.div
                ref={ref}
                className={clsx(
                    styles.root(variants),
                    sprinkles({ ...layoutProps, display: inline ? 'inline-grid' : 'grid' }),
                    className,
                )}
                style={{ ...cssVariables, ...style }}
                {...otherProps}
            >
                {children}
            </vapor.div>
        );
    },
);
Root.displayName = 'Grid';

/* -------------------------------------------------------------------------------------------------
 * Grid.Item
 * -----------------------------------------------------------------------------------------------*/

type GridItemPrimitiveProps = ComponentPropsWithoutRef<typeof vapor.div>;
type GridItemVariants = { rowSpan?: string; colSpan?: string };

interface GridItemProps extends GridItemPrimitiveProps, GridItemVariants {}

const Item = forwardRef<HTMLDivElement, GridItemProps>(
    ({ rowSpan, colSpan, className, style, children, ...props }, ref) => {
        const cssVariables = assignInlineVars({
            [styles.gridItemRowSpan]: rowSpan,
            [styles.gridItemColSpan]: colSpan,
        });

        return (
            <vapor.div
                ref={ref}
                style={{ ...cssVariables, ...style }}
                className={clsx(styles.item, className)}
                {...props}
            >
                {children}
            </vapor.div>
        );
    },
);
Item.displayName = 'Grid.Item';

/* -----------------------------------------------------------------------------------------------*/

export { Root as GridRoot, Item as GridItem };
export type { GridRootProps, GridItemProps };

export const Grid = { Root, Item };
