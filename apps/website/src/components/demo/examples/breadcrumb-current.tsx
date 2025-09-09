import { Breadcrumb } from '@vapor-ui/core';

export default function BreadcrumbCurrent() {
    return (
        <div className="flex flex-col gap-4">
            <div>
                <h4 className="mb-2 text-sm font-medium">Normal Links</h4>
                <Breadcrumb.Root size="md">
                    <Breadcrumb.List>
                        <Breadcrumb.Item>
                            <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Separator />
                        <Breadcrumb.Item>
                            <Breadcrumb.Link href="#">Products</Breadcrumb.Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Separator />
                        <Breadcrumb.Item>
                            <Breadcrumb.Link href="#">Category</Breadcrumb.Link>
                        </Breadcrumb.Item>
                    </Breadcrumb.List>
                </Breadcrumb.Root>
            </div>

            <div>
                <h4 className="mb-2 text-sm font-medium">With Current Page</h4>
                <Breadcrumb.Root size="md">
                    <Breadcrumb.List>
                        <Breadcrumb.Item>
                            <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Separator />
                        <Breadcrumb.Item>
                            <Breadcrumb.Link href="#">Products</Breadcrumb.Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Separator />
                        <Breadcrumb.Item>
                            <Breadcrumb.Link href="#" current>
                                Current Page
                            </Breadcrumb.Link>
                        </Breadcrumb.Item>
                    </Breadcrumb.List>
                </Breadcrumb.Root>
            </div>
        </div>
    );
}
