import { useMemo, useState } from 'react';

import type { SortingState } from '@tanstack/react-table';
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Badge, Box, Card, HStack, IconButton, Table } from '@vapor-ui/core';
import { ControlCommonIcon } from '@vapor-ui/icons';

export default function Sort() {
    const columns = useMemo<ColumnDef<Data>[]>(
        () => [
            {
                id: 'index',
                header: 'ID',
                accessorFn: (_, index) => index + 1,
                cell: ({ getValue }) => (
                    <Box $styles={{ textAlign: 'center' }}>{String(getValue() ?? '.')}</Box>
                ),
            },

            {
                header: 'Name',
                accessorKey: 'name',
                cell: (info) => info.getValue(),
            },

            {
                accessorKey: 'status',
                cell: ({ getValue }) => {
                    const status = getValue<string>();

                    return (
                        <Badge color={activeness[status]} shape="pill">
                            {status.toUpperCase()}
                        </Badge>
                    );
                },
            },

            {
                accessorKey: 'role',
                cell: (info) => info.getValue(),
            },

            {
                accessorKey: 'last-active',
                cell: (info) => info.getValue(),
                sortingFn: 'datetime',
            },
        ],
        [],
    );

    const [sorting, setSorting] = useState<SortingState>([]);

    const table = useReactTable({
        data: datas,
        columns,
        state: { sorting },
        enableRowSelection: true,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
    });

    return (
        <Card.Root $styles={{ width: '100%' }}>
            <Card.Body $styles={{ padding: '$000' }}>
                <Table.Root $styles={{ width: '100%' }}>
                    <Table.ColumnGroup>
                        <Table.Column width="10%" />
                    </Table.ColumnGroup>
                    <Table.Header $styles={{ borderRadius: 'inherit' }}>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <Table.Row
                                key={headerGroup.id}
                                $styles={{ backgroundColor: '$basic-gray-050' }}
                            >
                                {headerGroup.headers.map((header) => (
                                    <Table.Heading key={header.id}>
                                        <HStack
                                            $styles={{
                                                justifyContent:
                                                    header.id === 'index' ? 'center' : 'flex-start',
                                            }}
                                        >
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext(),
                                            )}

                                            <IconButton
                                                aria-label={`${header.id} sort`}
                                                variant="ghost"
                                                size="sm"
                                                onClick={header.column.getToggleSortingHandler()}
                                                color="secondary"
                                            >
                                                <ControlCommonIcon />
                                            </IconButton>
                                        </HStack>
                                    </Table.Heading>
                                ))}
                            </Table.Row>
                        ))}
                    </Table.Header>

                    <Table.Body>
                        {table.getRowModel().rows.map((row) => {
                            return (
                                <Table.Row key={row.id}>
                                    {row.getVisibleCells().map((cell) => {
                                        return (
                                            <Table.Cell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </Table.Cell>
                                        );
                                    })}
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
