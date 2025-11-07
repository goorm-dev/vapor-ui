import { Pagination } from '@vapor-ui/core';

export default function DefaultPagination() {
    return (
        <Pagination.Root totalPages={5}>
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
    );
}
