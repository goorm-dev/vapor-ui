import { forwardRef } from 'react';

import { useRenderElement } from '~/hooks/use-render-element';
import { cn } from '~/utils/cn';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import * as styles from './table.css';

/* -------------------------------------------------------------------------------------------------
 * Table.Root
 * -----------------------------------------------------------------------------------------------*/

/**
 * Root of the Table compound component, which displays data in rows and columns. Renders a `<table>` element.
 */
export const TableRoot = forwardRef<HTMLTableElement, TableRoot.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRenderElement({
        ref,
        render,
        defaultTagName: 'table',
        props: {
            className: cn(styles.table, className),
            ...componentProps,
        },
    });
});
TableRoot.displayName = 'Table.Root';

/* -------------------------------------------------------------------------------------------------
 * Table.Header
 * -----------------------------------------------------------------------------------------------*/

/**
 * Group of header rows at the top of the table. Renders a `<thead>` element.
 */
export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeader.Props>((props, ref) => {
    const { render, ...componentProps } = resolveStyles(props);

    return useRenderElement({
        ref,
        render,
        defaultTagName: 'thead',
        props: componentProps,
    });
});
TableHeader.displayName = 'Table.Header';

/* -------------------------------------------------------------------------------------------------
 * Table.Body
 * -----------------------------------------------------------------------------------------------*/

/**
 * Group of rows that hold the main data of the table. Renders a `<tbody>` element.
 */
export const TableBody = forwardRef<HTMLTableSectionElement, TableBody.Props>((props, ref) => {
    const { render, ...componentProps } = resolveStyles(props);

    return useRenderElement({
        ref,
        render,
        defaultTagName: 'tbody',
        props: componentProps,
    });
});
TableBody.displayName = 'Table.Body';

/* -------------------------------------------------------------------------------------------------
 * Table.Footer
 * -----------------------------------------------------------------------------------------------*/

/**
 * Group of rows at the bottom of the table, such as totals or summaries. Renders a `<tfoot>` element.
 */
export const TableFooter = forwardRef<HTMLTableSectionElement, TableFooter.Props>((props, ref) => {
    const { render, ...componentProps } = resolveStyles(props);

    return useRenderElement({
        ref,
        render,
        defaultTagName: 'tfoot',
        props: componentProps,
    });
});
TableFooter.displayName = 'Table.Footer';

/* -------------------------------------------------------------------------------------------------
 * Table.Row
 * -----------------------------------------------------------------------------------------------*/

/**
 * Row of cells in the table, separated from the next row by a border. Renders a `<tr>` element.
 */
export const TableRow = forwardRef<HTMLTableRowElement, TableRow.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRenderElement({
        ref,
        render,
        defaultTagName: 'tr',
        props: {
            className: cn(styles.row, className),
            ...componentProps,
        },
    });
});
TableRow.displayName = 'Table.Row';

/* -------------------------------------------------------------------------------------------------
 * Table.Heading
 * -----------------------------------------------------------------------------------------------*/

/**
 * Header cell that labels a column or row. Renders a `<th>` element.
 */
export const TableHeading = forwardRef<HTMLTableCellElement, TableHeading.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRenderElement({
        ref,
        render,
        defaultTagName: 'th',
        props: {
            className: cn(styles.heading, className),
            ...componentProps,
        },
    });
});
TableHeading.displayName = 'Table.Heading';

/* -------------------------------------------------------------------------------------------------
 * Table.Cell
 * -----------------------------------------------------------------------------------------------*/

/**
 * Data cell in a table row. Renders a `<td>` element.
 */
export const TableCell = forwardRef<HTMLTableCellElement, TableCell.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRenderElement({
        ref,
        render,
        defaultTagName: 'td',
        props: {
            className: cn(styles.cell, className),
            ...componentProps,
        },
    });
});
TableCell.displayName = 'Table.Cell';

/* -------------------------------------------------------------------------------------------------
 * Table.ColumnGroup
 * -----------------------------------------------------------------------------------------------*/

/**
 * Group of `Table.Column` parts that set the width or style of the table's columns. Renders a `<colgroup>` element.
 */
export const TableColumnGroup = forwardRef<HTMLTableColElement, TableColumnGroup.Props>(
    (props, ref) => {
        const { render, ...componentProps } = resolveStyles(props);

        return useRenderElement({
            ref,
            render,
            defaultTagName: 'colgroup',
            props: componentProps,
        });
    },
);
TableColumnGroup.displayName = 'Table.ColumnGroup';

/* -------------------------------------------------------------------------------------------------
 * Table.Column
 * -----------------------------------------------------------------------------------------------*/

/**
 * Column inside `Table.ColumnGroup`, used to set the width or style of one or more columns. Renders a `<col>` element.
 */
export const TableColumn = forwardRef<HTMLTableColElement, TableColumn.Props>((props, ref) => {
    const { render, ...componentProps } = resolveStyles(props);

    return useRenderElement({
        ref,
        render,
        defaultTagName: 'col',
        props: componentProps,
    });
});
TableColumn.displayName = 'Table.Column';

/* -----------------------------------------------------------------------------------------------*/

export namespace TableRoot {
    export type State = {};
    export type Props = VaporUIComponentProps<'table', State>;
}

export namespace TableHeader {
    export type State = {};
    export type Props = VaporUIComponentProps<'thead', State>;
}

export namespace TableBody {
    export type State = {};
    export type Props = VaporUIComponentProps<'tbody', State>;
}

export namespace TableFooter {
    export type State = {};
    export type Props = VaporUIComponentProps<'tfoot', State>;
}

export namespace TableRow {
    export type State = {};
    export type Props = VaporUIComponentProps<'tr', State>;
}

export namespace TableHeading {
    export type State = {};
    export type Props = VaporUIComponentProps<'th', State>;
}

export namespace TableCell {
    export type State = {};
    export type Props = VaporUIComponentProps<'td', State>;
}

export namespace TableColumnGroup {
    export type State = {};
    export type Props = VaporUIComponentProps<'colgroup', State>;
}

export namespace TableColumn {
    export type State = {};
    export type Props = VaporUIComponentProps<'col', State>;
}
