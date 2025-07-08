import type { CSSProperties } from 'react';
import { forwardRef } from 'react';

import { assignInlineVars } from '@vanilla-extract/dynamic';
import clsx from 'clsx';

import type { VaporComponentProps } from '~/libs/factory';
import { vapor } from '~/libs/factory';
import { createSplitProps } from '~/utils/create-split-props';

import type { GridRootVariants } from './grid.css';
import * as styles from './grid.css';

/* -------------------------------------------------------------------------------------------------
 * Grid
 * -----------------------------------------------------------------------------------------------*/

type GridPrimitiveProps = VaporComponentProps<'div'>;
type GridVariants = GridRootVariants & {
    inline?: boolean;
    templateRows?: string;
    templateColumns?: string;
    flow?: CSSProperties['gridAutoFlow'];
};

type GridRootProps = GridPrimitiveProps & GridVariants;

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

type GridItemPrimitiveProps = VaporComponentProps<'div'>;
type GridItemVariants = { rowSpan?: string; colSpan?: string };

type GridItemProps = GridItemPrimitiveProps & GridItemVariants;

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
