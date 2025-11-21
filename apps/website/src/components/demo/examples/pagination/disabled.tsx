import { Pagination } from '@vapor-ui/core';

export default function PaginationDisabled() {
    return (
        <Pagination.Root totalPages={5} disabled>
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
