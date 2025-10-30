import type { CSSProperties } from 'react';
import { useMemo, useState } from 'react';

import { makeStateUpdater } from '@tanstack/react-table';
import type {
    Column,
    ColumnDef,
    OnChangeFn,
    RowData,
    TableFeature,
    Table as TanstackTable,
    Updater,
} from '@tanstack/react-table';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Badge, Box, Card, HStack, IconButton, Table } from '@vapor-ui/core';
import { ChevronDoubleLeftOutlineIcon, ChevronDoubleRightOutlineIcon } from '@vapor-ui/icons';

export default function Collapsed() {
    const columns = useMemo<ColumnDef<Data>[]>(
        () => [
            {
                header: 'ID',
                accessorKey: 'id',
                size: 0, // prevent cumulative layout shift
                cell: ({ row }) => <div style={{ textAlign: 'center' }}>{row.index + 1}</div>,
            },

            {
                header: ({ column }) => {
                    const isCollapsed = column.getIsCollapsed();
                    const IconElement = isCollapsed
                        ? ChevronDoubleRightOutlineIcon
                        : ChevronDoubleLeftOutlineIcon;

                    return (
                        <HStack justifyContent="space-between" alignItems="center">
                            {isCollapsed ? '' : 'Name'}

                            <IconButton
                                aria-label="Toggle Name column"
                                size="sm"
                                color="secondary"
                                variant="ghost"
                                onClick={() => column.toggleCollapsed()}
                            >
                                <IconElement />
                            </IconButton>
                        </HStack>
                    );
                },
                accessorKey: 'name',
                size: 0, // prevent cumulative layout shift
                cell: ({ row, column }) => {
                    const isCollapsed = column.getIsCollapsed();

                    return (
                        <Box
                            display={isCollapsed ? 'block' : 'flex'}
                            width={isCollapsed ? '32px' : '240px'}
                            style={{
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                wordBreak: 'break-all',
                            }}
                        >
                            {row.getValue('name')}
                        </Box>
                    );
                },
            },

            {
                header: 'Status',
                accessorKey: 'status',
                size: 128,
                cell: ({ row }) => {
                    const status = row.getValue<string>('status');

                    return (
                        <Box width="128px">
                            <Badge color={activeness[status]} shape="pill">
                                {status.toUpperCase()}
                            </Badge>
                        </Box>
                    );
                },
            },

            {
                header: () => <Box width="400px">Role</Box>,
                accessorKey: 'role',
            },

            {
                header: () => <Box width="400px">Last Active</Box>,
                accessorKey: 'last-active',
            },
        ],
        [],
    );

    const [columnCollapsed, setColumnCollapsed] = useState<ColumnCollapsedState>(['name']); // 초기에 접힐 컬럼들

    const table = useReactTable({
        _features: [ColumnCollapsedFeature],
        data: datas,
        columns,
        state: {
            columnPinning: { left: ['id', 'name'] },
            columnCollapsed,
        },
        enableRowSelection: true,
        getCoreRowModel: getCoreRowModel(),
        onColumnCollapsedChange: setColumnCollapsed,
    });

    return (
        <Card.Root style={{ width: '100%' }}>
            <Card.Body style={{ overflow: 'auto', padding: 0 }}>
                <Table.Root style={{ width: '100%' }}>
                    <Table.ColumnGroup>
                        <Table.Column width="62px" />
                    </Table.ColumnGroup>

                    <Table.Header>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <Table.Row key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <Table.Heading
                                        key={header.id}
                                        ref={(thElem) =>
                                            columnSizingHandler(thElem, table, header.column)
                                        }
                                        style={{
                                            backgroundColor: 'var(--vapor-color-gray-050)',
                                            ...getCommonPinningStyles(header.column),
                                        }}
                                    >
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext(),
                                        )}
                                    </Table.Heading>
                                ))}
                            </Table.Row>
                        ))}
                    </Table.Header>

                    <Table.Body>
                        {table.getRowModel().rows.map((row) => {
                            return (
                                <Table.Row key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <Table.Cell
                                            key={cell.id}
                                            style={{
                                                backgroundColor: 'var(--vapor-color-white)',
                                                ...getCommonPinningStyles(cell.column),
                                            }}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </Table.Cell>
                                    ))}
                                </Table.Row>
                            );
                        })}
                    </Table.Body>
                </Table.Root>
            </Card.Body>
        </Card.Root>
    );
}

/* -----------------------------------------------------------------------------------------------*/

type Data = {
    name: string;
    status: 'active' | 'inactive';
    role: string;
    'last-active': string;
};

const datas: Data[] = [
    { name: 'Olivia Park', status: 'active', role: 'designer', 'last-active': '2 hours ago' },
    { name: 'Ethan Kim', status: 'active', role: 'developer', 'last-active': '3 days ago' },
    { name: 'Mia Choi', status: 'inactive', role: 'developer', 'last-active': '10 minutes ago' },
    { name: 'Noah Lee', status: 'active', role: 'designer', 'last-active': '1 day ago' },
    { name: 'Ava Jung', status: 'active', role: 'developer', 'last-active': '5 days ago' },
    { name: 'Liam Han', status: 'inactive', role: 'developer', 'last-active': '5 days ago' },
    { name: 'Emma Seo', status: 'active', role: 'designer', 'last-active': '7 days ago' },
    { name: 'Mason Yoo', status: 'active', role: 'designer', 'last-active': '30 minutes ago' },
    { name: 'Sophia Lim', status: 'inactive', role: 'designer', 'last-active': '4 hours ago' },
    { name: 'Lucas Park', status: 'active', role: 'developer', 'last-active': '1 hour ago' },
];

const getCommonPinningStyles = (column: Column<Data>): CSSProperties => {
    const isPinned = column.getIsPinned();
    const lastPinnedColumn = isPinned === 'left' && column.getIsLastColumn('left');

    return {
        boxShadow: lastPinnedColumn ? '-3px 0 0 0 rgba(0, 0, 0, 0.06) inset' : undefined,
        left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
        position: isPinned ? 'sticky' : 'unset',
        zIndex: isPinned ? 1 : undefined,
    };
};

const activeness: Record<string, Badge.Props['color']> = {
    active: 'success',
    inactive: 'hint',
};

const columnSizingHandler = (
    thElem: HTMLTableCellElement | null,
    table: TanstackTable<Data>,
    column: Column<Data>,
) => {
    if (!thElem) return;
    if (table.getState().columnSizing[column.id] !== undefined) return;
    if (table.getState().columnSizing[column.id] === thElem.getBoundingClientRect().width) return;

    table.setColumnSizing((prevSizes) => ({
        ...prevSizes,
        [column.id]: thElem.getBoundingClientRect().width,
    }));
};

/* -----------------------------------------------------------------------------------------------*/

export type ColumnCollapsedState = string[];

export interface ColumnCollapsedTableState {
    columnCollapsed: ColumnCollapsedState;
}

export interface ColumnCollapsedOptions {
    enableColumnCollapsed?: boolean;
    onColumnCollapsedChange?: OnChangeFn<ColumnCollapsedState>;
}

export interface ColumnCollapsedColumnInstance {
    getIsCollapsed: () => boolean;
    toggleCollapsed: () => void;
}

declare module '@tanstack/react-table' {
    interface TableState extends ColumnCollapsedTableState {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface TableOptionsResolved<TData extends RowData> extends ColumnCollapsedOptions {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Column<TData extends RowData, TValue = unknown>
        extends ColumnCollapsedColumnInstance {}
}

export const ColumnCollapsedFeature: TableFeature<unknown> = {
    getInitialState: (state): ColumnCollapsedTableState => {
        return {
            columnCollapsed: [],
            ...state,
        };
    },

    getDefaultOptions: <TData extends RowData>(
        table: TanstackTable<TData>,
    ): ColumnCollapsedOptions => {
        return {
            enableColumnCollapsed: true,
            onColumnCollapsedChange: makeStateUpdater('columnCollapsed', table),
        };
    },

    createColumn: <TData extends RowData>(
        column: Column<TData, unknown>,
        table: TanstackTable<TData>,
    ): void => {
        column.getIsCollapsed = () => {
            return table.getState().columnCollapsed?.includes(column.id) ?? false;
        };

        column.toggleCollapsed = () => {
            const currentState = column.getIsCollapsed();
            const updater: Updater<ColumnCollapsedState> = (old) => {
                if (currentState) return old.filter((id) => id !== column.id);

                return [...old, column.id];
            };
            table.options.onColumnCollapsedChange?.(updater);
        };
    },
};
