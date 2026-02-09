import { useState } from 'react';

import { Button, HStack, Pagination, Text, VStack } from '@vapor-ui/core';

export default function PaginationControlled() {
    const [page, setPage] = useState(7);

    return (
        <VStack $styles={{ gap: '$200' }}>
            <Pagination.Root totalPages={20} page={page} onPageChange={setPage}>
                <Pagination.Previous />
                <Pagination.Items />
                <Pagination.Next />
            </Pagination.Root>

            <HStack $styles={{ justifyContent: 'space-between', alignItems: 'center', gap: '$100' }}>
                <Text typography="subtitle1">Current Page is, {page}</Text>

                <Button variant="ghost" onClick={() => setPage(7)}>
                    Move to Page 7
                </Button>
            </HStack>
        </VStack>
    );
}
