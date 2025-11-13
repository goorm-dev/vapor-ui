import { useState } from 'react';

import { Button, HStack, Pagination, Text, VStack } from '@vapor-ui/core';

export default function PaginationControlled() {
    const [page, setPage] = useState(7);

    return (
        <VStack gap="$200">
            <Pagination.Root totalPages={20} page={page} onPageChange={setPage}>
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

            <HStack justifyContent="space-between" alignItems="center" gap="$100">
                <Text typography="subtitle1">Current Page is, {page}</Text>

                <Button variant="ghost" onClick={() => setPage(7)}>
                    Move to Page 7
                </Button>
            </HStack>
        </VStack>
    );
}
