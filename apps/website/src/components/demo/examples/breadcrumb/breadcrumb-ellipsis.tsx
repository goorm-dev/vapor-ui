import { Breadcrumb } from '@vapor-ui/core';

export default function BreadcrumbEllipsis() {
    return (
        <Breadcrumb.Root size="md">
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item href="#">Category</Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Ellipsis />
            <Breadcrumb.Separator />
            <Breadcrumb.Item href="#">Subcategory</Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item href="#" current>
                Current Page
            </Breadcrumb.Item>
        </Breadcrumb.Root>
    );
}
