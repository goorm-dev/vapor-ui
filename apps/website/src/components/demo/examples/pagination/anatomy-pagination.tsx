import { Pagination } from '@vapor-ui/core';

export default function AnatomyPagination() {
    return (
        <Pagination.Root data-part="Root" totalPages={5}>
            <Pagination.Previous data-part="Previous" />
            <Pagination.Items data-part="Items" />
            <Pagination.Next data-part="Next" />
        </Pagination.Root>
    );
}
