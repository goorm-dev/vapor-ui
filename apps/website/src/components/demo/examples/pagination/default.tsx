import { Pagination } from '@vapor-ui/core';

export default function DefaultPagination() {
    return (
        <Pagination.Root totalPages={5}>
            <Pagination.Previous />
            <Pagination.Items />
            <Pagination.Next />
        </Pagination.Root>
    );
}
