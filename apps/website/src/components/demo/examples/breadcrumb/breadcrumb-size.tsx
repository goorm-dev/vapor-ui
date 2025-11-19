import { Breadcrumb } from '@vapor-ui/core';

export default function BreadcrumbSize() {
    return (
        <div className="flex flex-col gap-4">
            <div>
                <h4 className="mb-2 text-sm font-medium">Small</h4>
                <Breadcrumb.Root size="sm">
                    <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item href="#" current>
                        Current
                    </Breadcrumb.Item>
                </Breadcrumb.Root>
            </div>

            <div>
                <h4 className="mb-2 text-sm font-medium">Medium</h4>
                <Breadcrumb.Root size="md">
                    <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item href="#" current>
                        Current
                    </Breadcrumb.Item>
                </Breadcrumb.Root>
            </div>

            <div>
                <h4 className="mb-2 text-sm font-medium">Large</h4>
                <Breadcrumb.Root size="lg">
                    <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item href="#" current>
                        Current
                    </Breadcrumb.Item>
                </Breadcrumb.Root>
            </div>

            <div>
                <h4 className="mb-2 text-sm font-medium">Extra Large</h4>
                <Breadcrumb.Root size="xl">
                    <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
                    <Breadcrumb.Separator />
                    <Breadcrumb.Item href="#" current>
                        Current
                    </Breadcrumb.Item>
                </Breadcrumb.Root>
            </div>
        </div>
    );
}
