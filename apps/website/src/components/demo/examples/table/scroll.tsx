import { useMemo, useState } from 'react';

import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Badge, Box, Card, Table } from '@vapor-ui/core';

export default function Scroll() {
    const [rowSelection, setRowSelection] = useState({});

    const columns = useMemo<ColumnDef<Data>[]>(
        () => [
            {
                header: 'ID',
                accessorKey: 'id',
                size: 0, // prevent cumulative layout shift
                cell: ({ row }) => <div style={{ textAlign: 'center' }}>{row.index + 1}</div>,
            },

            {
                header: 'Name',
                accessorKey: 'name',
                size: 0, // prevent cumulative layout shift
                cell: ({ row }) => <div style={{ textWrap: 'nowrap' }}>{row.getValue('name')}</div>,
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

    const table = useReactTable({
        data: datas,
        columns,
        state: { rowSelection, columnPinning: { left: ['id', 'name'] } },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <Card.Root style={{ width: '100%' }}>
            <Card.Body style={{ overflow: 'auto', padding: 0 }}>
                <Table.Root>
                    <Table.Header>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <Table.Row key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <Table.Heading
                                        key={header.id}
                                        style={{ backgroundColor: 'var(--vapor-color-gray-050)' }}
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
                                            style={{ backgroundColor: 'var(--vapor-color-white)' }}
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

const activeness: Record<string, Badge.Props['color']> = {
    active: 'success',
    inactive: 'hint',
};
