'use client';

import { forwardRef } from 'react';

import clsx from 'clsx';

import { type VaporComponentProps, vapor } from '~/libs/factory';

import type { GridRootVariants } from './grid.css';
import * as styles from './grid.css';

/* -------------------------------------------------------------------------------------------------
 * Grid.Root
 * -----------------------------------------------------------------------------------------------*/

type GridCustomVariants = {
    /**
     * Set `display` to `inline-grid`.
     * @default false
     */
    inline?: boolean;
};

interface GridRootProps extends VaporComponentProps<'div'>, GridRootVariants, GridCustomVariants {}

const Root = forwardRef<HTMLDivElement, GridRootProps>((props, ref) => {
    const { flow, inline, className } = props;

    return (
        <vapor.div
            ref={ref}
            display={inline ? 'inline-grid' : 'grid'}
            className={clsx(styles.root({ flow }), className)}
            {...props}
        />
    );
});
Root.displayName = 'Grid.Root';

/* -------------------------------------------------------------------------------------------------
 * Grid.Item
 * -----------------------------------------------------------------------------------------------*/

interface GridItemProps extends VaporComponentProps<'div'> {}

const Item = forwardRef<HTMLDivElement, GridItemProps>((props, ref) => {
    const { className } = props;

    return <vapor.div ref={ref} className={clsx(styles.item, className)} {...props} />;
});
Item.displayName = 'Grid.Item';

/* -----------------------------------------------------------------------------------------------*/

export const Grid = {
    Root,
    Item,
};

export { Root as GridRoot, Item as GridItem };
export type { GridRootProps, GridItemProps };
