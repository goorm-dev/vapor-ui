import { Pagination, Text, VStack } from '@vapor-ui/core';

export default function PaginationSiblingCount() {
    return (
        <VStack gap="$300">
            <VStack gap="$050">
                <Text typography="subtitle1">1 Sibling</Text>
                <Pagination.Root defaultPage={8} totalPages={20} siblingCount={1}>
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

            <VStack gap="$050">
                <Text typography="subtitle1">3 Sibling</Text>
                <Pagination.Root defaultPage={8} totalPages={20} siblingCount={3}>
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
        </VStack>
    );
}
