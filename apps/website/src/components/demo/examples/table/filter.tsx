import { useMemo, useState } from 'react';

import type { ColumnFiltersState, Row } from '@tanstack/react-table';
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from '@tanstack/react-table';
import {
    Badge,
    Button,
    Card,
    Flex,
    HStack,
    MultiSelect,
    Select,
    Table,
    Text,
    TextInput,
} from '@vapor-ui/core';
import { PlusOutlineIcon, SearchOutlineIcon } from '@vapor-ui/icons';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const customFilterFn = (row: Row<Data>, columnId: string, filterValue: any) => {
    if (!filterValue || filterValue.length === 0) return true;

    const cellValue = row.getValue(columnId) as string;
    return filterValue.includes(cellValue);
};

export default function Scroll() {
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
                filterFn: customFilterFn,
            },

            {
                header: 'Role',
                accessorKey: 'role',
                filterFn: customFilterFn,
            },

            {
                header: 'Last Active',
                accessorKey: 'last-active',
            },
        ],
        [],
    );

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const table = useReactTable({
        data: datas,
        columns,
        state: { columnFilters },
        enableRowSelection: true,

        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onColumnFiltersChange: setColumnFilters,
    });

    return (
        <Card.Root style={{ width: '100%' }}>
            <Card.Header>
                <HStack justifyContent="space-between" alignItems="center">
                    <Text typography="heading6" foreground="normal-200" style={{ flexShrink: 0 }}>
                        출석부
                    </Text>

                    <HStack alignItems="center" gap="$100">
                        <HStack
                            alignItems="center"
                            gap="10px"
                            paddingX="$150"
                            border="1px solid var(--vapor-color-border-normal)"
                            borderRadius="$300"
                        >
                            <SearchOutlineIcon />
                            <TextInput
                                placeholder="이름으로 검색"
                                style={{ border: 'none', paddingInline: 0 }}
                                onValueChange={(value) =>
                                    table.getColumn('name')?.setFilterValue(value)
                                }
                            />
                        </HStack>

                        <FilterSelect
                            triggerLabel="Status"
                            onValueChange={(value) => {
                                table.getColumn('status')?.setFilterValue(value);
                            }}
                            content={
                                <>
                                    <MultiSelect.Item value="active">
                                        Active
                                        <MultiSelect.ItemIndicator />
                                    </MultiSelect.Item>
                                    <MultiSelect.Item value="inactive">
                                        Inactive
                                        <MultiSelect.ItemIndicator />
                                    </MultiSelect.Item>
                                </>
                            }
                        />

                        <FilterSelect
                            triggerLabel="Role"
                            onValueChange={(value) =>
                                table.getColumn('role')?.setFilterValue(value)
                            }
                            content={
                                <>
                                    <MultiSelect.Item value="designer">
                                        Designer
                                        <MultiSelect.ItemIndicator />
                                    </MultiSelect.Item>
                                    <MultiSelect.Item value="developer">
                                        Developer
                                        <MultiSelect.ItemIndicator />
                                    </MultiSelect.Item>
                                </>
                            }
                        />

                        <FilterSelect
                            triggerLabel="Columns"
                            value={table
                                .getAllColumns()
                                .filter((col) => col.getIsVisible())
                                .map((col) => col.id)}
                            content={table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => (
                                    <MultiSelect.Item
                                        key={column.id}
                                        value={column.id}
                                        onClick={() => column.toggleVisibility()}
                                    >
                                        {column.id}

                                        <MultiSelect.ItemIndicator />
                                    </MultiSelect.Item>
                                ))}
                        />

                        <Button>
                            <PlusOutlineIcon size="16px" /> 추가
                        </Button>
                    </HStack>
                </HStack>
            </Card.Header>
            <Card.Body style={{ overflow: 'auto', padding: 0 }}>
                <Table.Root>
                    <Table.ColumnGroup>
                        <Table.Column width="5%" />
                        <Table.Column width="15%" />
                        <Table.Column width="15%" />
                        <Table.Column width="40%" />
                        <Table.Column width="25%" />
                    </Table.ColumnGroup>

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
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => {
                                return (
                                    <Table.Row key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <Table.Cell
                                                key={cell.id}
                                                style={{
                                                    backgroundColor: 'var(--vapor-color-white)',
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
                            })
                        ) : (
                            <Table.Row>
                                <Table.Cell
                                    colSpan={columns.length}
                                    style={{ textAlign: 'center', height: 410 }}
                                >
                                    검색 결과가 없습니다.
                                </Table.Cell>
                            </Table.Row>
                        )}
                    </Table.Body>
                </Table.Root>
                <Card.Footer render={<Flex justifyContent="flex-end" />}>
                    <Select.Root
                        value={table.getState().pagination.pageSize}
                        onValueChange={(value) => table.setPageSize(Number(value))}
                    >
                        <Select.Trigger>
                            <Select.Value>{(value) => `${value}개씩 보기`}</Select.Value>
                            <Select.TriggerIcon />
                        </Select.Trigger>

                        <Select.Content>
                            {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                                <Select.Item key={pageSize} value={pageSize}>
                                    {pageSize}
                                    <Select.ItemIndicator />
                                </Select.Item>
                            ))}
                        </Select.Content>
                    </Select.Root>
                </Card.Footer>
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

/* -----------------------------------------------------------------------------------------------*/

interface FilterSelectProps extends React.ComponentProps<typeof MultiSelect.Root> {
    triggerLabel: string;
    content: React.ReactNode;
}

const FilterSelect = ({ content, triggerLabel, ...props }: FilterSelectProps) => {
    return (
        <MultiSelect.Root {...props}>
            <MultiSelect.Trigger
                render={<Button variant="fill" color="secondary" />}
                style={{ width: 'unset' }}
            >
                {triggerLabel}
                <MultiSelect.TriggerIcon />
            </MultiSelect.Trigger>
            <MultiSelect.Content positionerProps={{ align: 'end' }}>{content}</MultiSelect.Content>
        </MultiSelect.Root>
    );
};
