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
    Box,
    Button,
    Card,
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
                header: () => <Box $styles={{ textAlign: 'center' }}> ID</Box>,
                accessorKey: 'id',
                size: 0, // prevent cumulative layout shift
                cell: ({ row }) => <Box $styles={{ textAlign: 'center' }}>{row.index + 1}</Box>,
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
        <Card.Root $styles={{ width: '100%' }}>
            <Card.Header>
                <HStack $styles={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text typography="heading6" foreground="normal-200" style={{ flexShrink: 0 }}>
                        출석부
                    </Text>

                    <HStack $styles={{ alignItems: 'center', gap: '$100' }}>
                        <HStack
                            $styles={{
                                alignItems: 'center',
                                gap: '10px',
                                paddingInline: '$150',
                                border: '1px solid',
                                borderColor: '$normal',
                                borderRadius: '$300',
                            }}
                        >
                            <SearchOutlineIcon />
                            <TextInput
                                placeholder="이름으로 검색"
                                $styles={{ border: 'none', paddingInline: '$000' }}
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
                                    <MultiSelect.Item value="active">Active</MultiSelect.Item>
                                    <MultiSelect.Item value="inactive">Inactive</MultiSelect.Item>
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
                                    <MultiSelect.Item value="designer">Designer</MultiSelect.Item>
                                    <MultiSelect.Item value="developer">Developer</MultiSelect.Item>
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
                                    </MultiSelect.Item>
                                ))}
                        />

                        <Button>
                            <PlusOutlineIcon size="16px" /> 추가
                        </Button>
                    </HStack>
                </HStack>
            </Card.Header>
            <Card.Body $styles={{ overflow: 'auto', padding: '$000' }}>
                <Table.Root $styles={{ width: '100%' }}>
                    <Table.ColumnGroup>
                        <Table.Column width="10%" />
                    </Table.ColumnGroup>

                    <Table.Header>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <Table.Row key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <Table.Heading
                                        key={header.id}
                                        $styles={{ backgroundColor: '$gray-050' }}
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
                                            <Table.Cell key={cell.id}>
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
                                    $styles={{ textAlign: 'center', height: '410px' }}
                                >
                                    검색 결과가 없습니다.
                                </Table.Cell>
                            </Table.Row>
                        )}
                    </Table.Body>
                </Table.Root>
                <Card.Footer $styles={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Select.Root
                        value={table.getState().pagination.pageSize}
                        onValueChange={(value) => table.setPageSize(Number(value))}
                    >
                        <Select.TriggerPrimitive>
                            <Select.ValuePrimitive>
                                {(value) => `${value}개씩 보기`}
                            </Select.ValuePrimitive>
                            <Select.TriggerIconPrimitive />
                        </Select.TriggerPrimitive>

                        <Select.Popup>
                            {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                                <Select.Item key={pageSize} value={pageSize}>
                                    {pageSize}
                                </Select.Item>
                            ))}
                        </Select.Popup>
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
            <MultiSelect.TriggerPrimitive
                render={<Button variant="fill" color="secondary" />}
                style={{ width: 'unset' }}
            >
                {triggerLabel}
                <MultiSelect.TriggerIconPrimitive />
            </MultiSelect.TriggerPrimitive>
            <MultiSelect.Popup positionerElement={<MultiSelect.PositionerPrimitive align="end" />}>
                {content}
            </MultiSelect.Popup>
        </MultiSelect.Root>
    );
};
