import { Breadcrumb } from '@vapor-ui/core';

export default function BreadcrumbSize() {
    return (
        <div className="flex flex-col gap-4">
            <div>
                <h4 className="mb-2 text-sm font-medium">Small</h4>
                <Breadcrumb.Root size="sm">
                    <Breadcrumb.List>
                        <Breadcrumb.Item>
                            <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Separator />
                        <Breadcrumb.Item>
                            <Breadcrumb.Link href="#" current>Current</Breadcrumb.Link>
                        </Breadcrumb.Item>
                    </Breadcrumb.List>
                </Breadcrumb.Root>
            </div>

            <div>
                <h4 className="mb-2 text-sm font-medium">Medium</h4>
                <Breadcrumb.Root size="md">
                    <Breadcrumb.List>
                        <Breadcrumb.Item>
                            <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Separator />
                        <Breadcrumb.Item>
                            <Breadcrumb.Link href="#" current>Current</Breadcrumb.Link>
                        </Breadcrumb.Item>
                    </Breadcrumb.List>
                </Breadcrumb.Root>
            </div>

            <div>
                <h4 className="mb-2 text-sm font-medium">Large</h4>
                <Breadcrumb.Root size="lg">
                    <Breadcrumb.List>
                        <Breadcrumb.Item>
                            <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Separator />
                        <Breadcrumb.Item>
                            <Breadcrumb.Link href="#" current>Current</Breadcrumb.Link>
                        </Breadcrumb.Item>
                    </Breadcrumb.List>
                </Breadcrumb.Root>
            </div>

            <div>
                <h4 className="mb-2 text-sm font-medium">Extra Large</h4>
                <Breadcrumb.Root size="xl">
                    <Breadcrumb.List>
                        <Breadcrumb.Item>
                            <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Separator />
                        <Breadcrumb.Item>
                            <Breadcrumb.Link href="#" current>Current</Breadcrumb.Link>
                        </Breadcrumb.Item>
                    </Breadcrumb.List>
                </Breadcrumb.Root>
            </div>
        </div>
    );
}