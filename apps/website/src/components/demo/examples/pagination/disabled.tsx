import { Pagination } from '@vapor-ui/core';

export default function PaginationDisabled() {
    return (
        <Pagination.Root totalPages={5} disabled>
            <Pagination.Previous />
            <Pagination.Items />
            <Pagination.Next />
        </Pagination.Root>
    );
}
