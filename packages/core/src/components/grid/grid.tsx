import { type CSSProperties, type ComponentPropsWithoutRef, forwardRef } from 'react';

import { assignInlineVars } from '@vanilla-extract/dynamic';
import clsx from 'clsx';

import { vapor } from '~/libs/factory';
import type { MergeRecipeVariants } from '~/libs/recipe';
import { createSplitProps } from '~/utils/create-split-props';

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

interface GridProps extends GridPrimitiveProps, GridVariants {}

const Root = forwardRef<HTMLDivElement, GridProps>(
    ({ className, style, children, ...props }, ref) => {
        const [gridProps, otherProps] = createSplitProps<GridVariants>()(props, [
            'inline',
            'templateRows',
            'templateColumns',
            'flow',
        ]);

        const { inline, templateRows, templateColumns, ...variants } = gridProps;

        const cssVariables = assignInlineVars({
            [styles.gridTemplateRows]: templateRows,
            [styles.gridTemplateColumns]: templateColumns,
        });

        return (
            <vapor.div
                ref={ref}
                display={inline ? 'inline-grid' : 'grid'}
                style={{ ...cssVariables, ...style }}
                className={clsx(styles.root(variants), className)}
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

export const Grid = Object.assign(Root, { Item });
export type { GridProps, GridItemProps };
