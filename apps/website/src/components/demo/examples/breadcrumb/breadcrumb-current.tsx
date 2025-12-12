import { Breadcrumb } from '@vapor-ui/core';

export default function BreadcrumbCurrent() {
    return (
        <div className="flex flex-col gap-4">
            <div>
                <h4 className="mb-2 text-sm font-medium">Normal Links</h4>
                <Breadcrumb.Root size="md">
                    <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item href="#">Products</Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item href="#">Category</Breadcrumb.Item>
                </Breadcrumb.Root>
            </div>

            <div>
                <h4 className="mb-2 text-sm font-medium">With Current Page</h4>
                <Breadcrumb.Root size="md">
                    <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item href="#">Products</Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item href="#" current>
                        Current Page
                    </Breadcrumb.Item>
                </Breadcrumb.Root>
            </div>
        </div>
    );
}
