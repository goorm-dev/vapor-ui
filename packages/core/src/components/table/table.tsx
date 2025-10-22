import { forwardRef } from 'react';

import { useRender } from '@base-ui-components/react';
import clsx from 'clsx';

import type { VComponentProps } from '~/utils/types';

import * as styles from './table.css';

/* -------------------------------------------------------------------------------------------------
 * Table.Root
 * -----------------------------------------------------------------------------------------------*/

export const TableRoot = forwardRef<HTMLTableElement, TableRoot.Props>(
    ({ render, className, ...props }, ref) => {
        return useRender({
            ref,
            render: render || <table />,
            props: {
                className: clsx(styles.table, className),
                ...props,
            },
        });
    },
);
TableRoot.displayName = 'TableRoot';

/* -------------------------------------------------------------------------------------------------
 * Table.Header
 * -----------------------------------------------------------------------------------------------*/

export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeader.Props>(
    ({ render, ...props }, ref) => {
        return useRender({
            ref,
            render: render || <thead />,
            props,
        });
    },
);
TableHeader.displayName = 'TableHeader';

/* -------------------------------------------------------------------------------------------------
 * Table.Body
 * -----------------------------------------------------------------------------------------------*/

export const TableBody = forwardRef<HTMLTableSectionElement, TableBody.Props>(
    ({ render, ...props }, ref) => {
        return useRender({
            ref,
            render: render || <tbody />,
            props,
        });
    },
);
TableBody.displayName = 'TableBody';

/* -------------------------------------------------------------------------------------------------
 * Table.Footer
 * -----------------------------------------------------------------------------------------------*/

export const TableFooter = forwardRef<HTMLTableSectionElement, TableFooter.Props>(
    ({ render, ...props }, ref) => {
        return useRender({
            ref,
            render: render || <tfoot />,
            props,
        });
    },
);
TableFooter.displayName = 'TableFooter';

/* -------------------------------------------------------------------------------------------------
 * Table.Row
 * -----------------------------------------------------------------------------------------------*/

export const TableRow = forwardRef<HTMLTableRowElement, TableRow.Props>(
    ({ render, className, ...props }, ref) => {
        return useRender({
            ref,
            render: render || <tr />,
            props: {
                className: clsx(styles.row, className),
                ...props,
            },
        });
    },
);
TableRow.displayName = 'TableRow';

/* -------------------------------------------------------------------------------------------------
 * Table.Heading
 * -----------------------------------------------------------------------------------------------*/

export const TableHeading = forwardRef<HTMLTableCellElement, TableHeading.Props>(
    ({ render, className, ...props }, ref) => {
        return useRender({
            ref,
            render: render || <th />,
            props: {
                className: clsx(styles.heading, className),
                ...props,
            },
        });
    },
);
TableHeading.displayName = 'TableHeading';

/* -------------------------------------------------------------------------------------------------
 * Table.Cell
 * -----------------------------------------------------------------------------------------------*/

export const TableCell = forwardRef<HTMLTableCellElement, TableCell.Props>(
    ({ render, className, ...props }, ref) => {
        return useRender({
            ref,
            render: render || <td />,
            props: {
                className: clsx(styles.cell, className),
                ...props,
            },
        });
    },
);
TableCell.displayName = 'TableCell';

/* -------------------------------------------------------------------------------------------------
 * Table.ColumnGroup
 * -----------------------------------------------------------------------------------------------*/

export const TableColumnGroup = forwardRef<HTMLTableColElement, TableColumnGroup.Props>(
    ({ render, ...props }, ref) => {
        return useRender({
            ref,
            render: render || <colgroup />,
            props,
        });
    },
);
TableColumnGroup.displayName = 'TableColumnGroup';

/* -------------------------------------------------------------------------------------------------
 * Table.Column
 * -----------------------------------------------------------------------------------------------*/

export const TableColumn = forwardRef<HTMLTableColElement, TableColumn.Props>(
    ({ render, ...props }, ref) => {
        return useRender({
            ref,
            render: render || <col />,
            props,
        });
    },
);
TableColumn.displayName = 'TableColumn';

/* -------------------------------------------------------------------------------------------------
 * Table.Caption
 * -----------------------------------------------------------------------------------------------*/

export const TableCaption = forwardRef<HTMLTableCaptionElement, TableCaption.Props>(
    ({ render, ...props }, ref) => {
        return useRender({
            ref,
            render: render || <caption />,
            props: { ...props },
        });
    },
);
TableCaption.displayName = 'TableCaption';

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

export namespace TableCaption {
    export interface Props extends VComponentProps<'caption'> {}
}
