import { forwardRef } from 'react';

import { useRender } from '@base-ui-components/react';
import clsx from 'clsx';

import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

import * as styles from './table.css';

/* -------------------------------------------------------------------------------------------------
 * Table.Root
 * -----------------------------------------------------------------------------------------------*/

export const TableRoot = forwardRef<HTMLTableElement, TableRoot.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRender({
        ref,
        render: render || <table />,
        props: {
            className: clsx(styles.table, className),
            ...componentProps,
        },
    });
});
TableRoot.displayName = 'TableRoot';

/* -------------------------------------------------------------------------------------------------
 * Table.Header
 * -----------------------------------------------------------------------------------------------*/

export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeader.Props>((props, ref) => {
    const { render, ...componentProps } = resolveStyles(props);

    return useRender({
        ref,
        render: render || <thead />,
        props: componentProps,
    });
});
TableHeader.displayName = 'TableHeader';

/* -------------------------------------------------------------------------------------------------
 * Table.Body
 * -----------------------------------------------------------------------------------------------*/

export const TableBody = forwardRef<HTMLTableSectionElement, TableBody.Props>((props, ref) => {
    const { render, ...componentProps } = resolveStyles(props);

    return useRender({
        ref,
        render: render || <tbody />,
        props: componentProps,
    });
});
TableBody.displayName = 'TableBody';

/* -------------------------------------------------------------------------------------------------
 * Table.Footer
 * -----------------------------------------------------------------------------------------------*/

export const TableFooter = forwardRef<HTMLTableSectionElement, TableFooter.Props>((props, ref) => {
    const { render, ...componentProps } = resolveStyles(props);

    return useRender({
        ref,
        render: render || <tfoot />,
        props: componentProps,
    });
});
TableFooter.displayName = 'TableFooter';

/* -------------------------------------------------------------------------------------------------
 * Table.Row
 * -----------------------------------------------------------------------------------------------*/

export const TableRow = forwardRef<HTMLTableRowElement, TableRow.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRender({
        ref,
        render: render || <tr />,
        props: {
            className: clsx(styles.row, className),
            ...componentProps,
        },
    });
});
TableRow.displayName = 'TableRow';

/* -------------------------------------------------------------------------------------------------
 * Table.Heading
 * -----------------------------------------------------------------------------------------------*/

export const TableHeading = forwardRef<HTMLTableCellElement, TableHeading.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRender({
        ref,
        render: render || <th />,
        props: {
            className: clsx(styles.heading, className),
            ...componentProps,
        },
    });
});
TableHeading.displayName = 'TableHeading';

/* -------------------------------------------------------------------------------------------------
 * Table.Cell
 * -----------------------------------------------------------------------------------------------*/

export const TableCell = forwardRef<HTMLTableCellElement, TableCell.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRender({
        ref,
        render: render || <td />,
        props: {
            className: clsx(styles.cell, className),
            ...componentProps,
        },
    });
});
TableCell.displayName = 'TableCell';

/* -------------------------------------------------------------------------------------------------
 * Table.ColumnGroup
 * -----------------------------------------------------------------------------------------------*/

export const TableColumnGroup = forwardRef<HTMLTableColElement, TableColumnGroup.Props>(
    (props, ref) => {
        const { render, ...componentProps } = resolveStyles(props);

        return useRender({
            ref,
            render: render || <colgroup />,
            props: componentProps,
        });
    },
);
TableColumnGroup.displayName = 'TableColumnGroup';

/* -------------------------------------------------------------------------------------------------
 * Table.Column
 * -----------------------------------------------------------------------------------------------*/

export const TableColumn = forwardRef<HTMLTableColElement, TableColumn.Props>((props, ref) => {
    const { render, ...componentProps } = resolveStyles(props);

    return useRender({
        ref,
        render: render || <col />,
        props: componentProps,
    });
});
TableColumn.displayName = 'TableColumn';

/* -----------------------------------------------------------------------------------------------*/

export namespace TableRoot {
    export interface Props extends VComponentProps<'table'> {}
}

export namespace TableHeader {
    export interface Props extends VComponentProps<'thead'> {}
}

export namespace TableBody {
    export interface Props extends VComponentProps<'tbody'> {}
}

export namespace TableFooter {
    export interface Props extends VComponentProps<'tfoot'> {}
}

export namespace TableRow {
    export interface Props extends VComponentProps<'tr'> {}
}

export namespace TableHeading {
    export interface Props extends VComponentProps<'th'> {}
}

export namespace TableCell {
    export interface Props extends VComponentProps<'td'> {}
}

export namespace TableColumnGroup {
    export interface Props extends VComponentProps<'colgroup'> {}
}

export namespace TableColumn {
    export interface Props extends VComponentProps<'col'> {}
}
