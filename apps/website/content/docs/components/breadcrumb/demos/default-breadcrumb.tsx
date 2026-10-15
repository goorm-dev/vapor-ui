import { Breadcrumb } from '@vapor-ui/core';

export default function DefaultBreadcrumb() {
    return (
        <Breadcrumb.Root>
            <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item href="#">Products</Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item href="#" current>
                Details
            </Breadcrumb.Item>
        </Breadcrumb.Root>
    );
}
