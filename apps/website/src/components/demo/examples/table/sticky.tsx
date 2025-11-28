import type { CSSProperties } from 'react';
import { useMemo, useState } from 'react';

import type { Column, Table as TanstackTable } from '@tanstack/react-table';
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Badge, Box, Card, Table } from '@vapor-ui/core';

export default function Basic() {
    const [rowSelection, setRowSelection] = useState({});

    const columns = useMemo<ColumnDef<Data>[]>(
        () => [
            {
                header: () => <Box textAlign="center">ID</Box>,
                accessorKey: 'id',
                cell: ({ row }) => <Box textAlign="center">{row.index + 1}</Box>,
            },

            {
                header: 'Name',
                accessorKey: 'name',
                cell: ({ row }) => <Box style={{ textWrap: 'nowrap' }}>{row.getValue('name')}</Box>,
            },

            {
                header: 'Status',
                accessorKey: 'status',
                cell: ({ row }) => {
                    const status = row.getValue<string>('status');

                    return (
                        <Badge color={activeness[status]} shape="pill">
                            {status.toUpperCase()}
                        </Badge>
                    );
                },
            },

            {
                header: 'Role',
                accessorKey: 'role',
            },

            {
                header: 'Last Active',
                accessorKey: 'last-active',
            },
        ],
        [],
    );

    const table = useReactTable({
        data: datas,
        columns,
        state: { rowSelection, columnPinning: { left: ['id', 'name'] } },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <Card.Root width="100%">
            <Card.Body overflow="auto" padding="$000">
                <Table.Root width="200%">
                    <Table.ColumnGroup>
                        <Table.Column width="0" />
                        <Table.Column width="0" />
                        <Table.Column width="0" />
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
                                        backgroundColor="$white"
                                        style={{ ...getCommonPinningStyles(header.column) }}
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
                                            backgroundColor="$white"
                                            style={{ ...getCommonPinningStyles(cell.column) }}
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
