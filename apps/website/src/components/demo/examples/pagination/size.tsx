import { Pagination, VStack } from '@vapor-ui/core';

export default function PaginationSize() {
    return (
        <VStack gap="$050">
            <Pagination.Root totalPages={5} size="sm">
                <Pagination.List>
                    <Pagination.Item>
                        <Pagination.Previous />
                    </Pagination.Item>
                    <Pagination.Items />
                    <Pagination.Item>
                        <Pagination.Next />
                    </Pagination.Item>
                </Pagination.List>
            </Pagination.Root>
            <Pagination.Root totalPages={5} size="md">
                <Pagination.List>
                    <Pagination.Item>
                        <Pagination.Previous />
                    </Pagination.Item>
                    <Pagination.Items />
                    <Pagination.Item>
                        <Pagination.Next />
                    </Pagination.Item>
                </Pagination.List>
            </Pagination.Root>
            <Pagination.Root totalPages={5} size="lg">
                <Pagination.List>
                    <Pagination.Item>
                        <Pagination.Previous />
                    </Pagination.Item>
                    <Pagination.Items />
                    <Pagination.Item>
                        <Pagination.Next />
                    </Pagination.Item>
                </Pagination.List>
            </Pagination.Root>
            <Pagination.Root totalPages={5} size="xl">
                <Pagination.List>
                    <Pagination.Item>
                        <Pagination.Previous />
                    </Pagination.Item>
                    <Pagination.Items />
                    <Pagination.Item>
                        <Pagination.Next />
                    </Pagination.Item>
                </Pagination.List>
            </Pagination.Root>
        </VStack>
    );
}
