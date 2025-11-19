import { Pagination, VStack } from '@vapor-ui/core';

export default function PaginationSize() {
    return (
        <VStack gap="$050">
            <Pagination.Root totalPages={5} size="sm">
                <Pagination.Previous />
                <Pagination.Items />
                <Pagination.Next />
            </Pagination.Root>
            <Pagination.Root totalPages={5} size="md">
                <Pagination.Previous />
                <Pagination.Items />
                <Pagination.Next />
            </Pagination.Root>
            <Pagination.Root totalPages={5} size="lg">
                <Pagination.Previous />
                <Pagination.Items />
                <Pagination.Next />
            </Pagination.Root>
            <Pagination.Root totalPages={5} size="xl">
                <Pagination.Previous />
                <Pagination.Items />
                <Pagination.Next />
            </Pagination.Root>
        </VStack>
    );
}
