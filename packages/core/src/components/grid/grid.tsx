'use client';

import type { CSSProperties } from 'react';
import { forwardRef } from 'react';

import { assignInlineVars } from '@vanilla-extract/dynamic';
import clsx from 'clsx';

import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

import { Box } from '../box';
import type { RootVariants } from './grid.css';
import * as styles from './grid.css';

/* -------------------------------------------------------------------------------------------------
 * Grid
 * -----------------------------------------------------------------------------------------------*/

type GridVariants = RootVariants & {
    /** 인라인 그리드 여부 */
    inline?: boolean;
    /** 그리드 행 템플릿 */
    templateRows?: string;
    /** 그리드 열 템플릿 */
    templateColumns?: string;
    /** 그리드 아이템 배치 방향 */
    flow?: CSSProperties['gridAutoFlow'];
};

/**
 * CSS 그리드 레이아웃 컴포넌트
 */
export const GridRoot = forwardRef<HTMLDivElement, GridRoot.Props>((props, ref) => {
    const { className, style, ...componentProps } = resolveStyles(props);
    const [variantProps, otherProps] = createSplitProps<GridVariants>()(componentProps, [
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
        />
    );
});
GridRoot.displayName = 'Grid.Root';

/* -------------------------------------------------------------------------------------------------
 * Grid.Item
 * -----------------------------------------------------------------------------------------------*/

/**
 * 그리드 아이템 컴포넌트
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
            className={clsx(styles.item, className)}
            {...componentProps}
        />
    );
});
GridItem.displayName = 'Grid.Item';

/* -----------------------------------------------------------------------------------------------*/

export namespace GridRoot {
    type GridPrimitiveProps = VComponentProps<typeof Box>;

    export interface Props extends GridPrimitiveProps, GridVariants {}
}

export namespace GridItem {
    type GridItemPrimitiveProps = VComponentProps<typeof Box>;
    type GridItemVariants = {
        /** 행 범위 지정 */
        rowSpan?: string;
        /** 열 범위 지정 */
        colSpan?: string;
    };

    export interface Props extends GridItemPrimitiveProps, GridItemVariants {}
}
