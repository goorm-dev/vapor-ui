import { Breadcrumb } from '@vapor-ui/core';

export default function BreadcrumbEllipsis() {
    return (
        <Breadcrumb.Root size="md">
            <Breadcrumb.List>
                <Breadcrumb.Item>
                    <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
                </Breadcrumb.Item>
                <Breadcrumb.Separator />
                <Breadcrumb.Item>
                    <Breadcrumb.Link href="#">Category</Breadcrumb.Link>
                </Breadcrumb.Item>
                <Breadcrumb.Separator />
                <Breadcrumb.Item>
                    <Breadcrumb.Ellipsis />
                </Breadcrumb.Item>
                <Breadcrumb.Separator />
                <Breadcrumb.Item>
                    <Breadcrumb.Link href="#">Subcategory</Breadcrumb.Link>
                </Breadcrumb.Item>
                <Breadcrumb.Separator />
                <Breadcrumb.Item>
                    <Breadcrumb.Link href="#" current>
                        Current Page
                    </Breadcrumb.Link>
                </Breadcrumb.Item>
            </Breadcrumb.List>
        </Breadcrumb.Root>
    );
}