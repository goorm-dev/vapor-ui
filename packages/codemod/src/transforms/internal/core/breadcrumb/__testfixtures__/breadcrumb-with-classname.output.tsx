import { Breadcrumb } from '@vapor-ui/core';

export default function App() {
    return (
        <Breadcrumb.Root size="md">
            <Breadcrumb.List>
                <Breadcrumb.Item className="custom">
                    <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
                </Breadcrumb.Item>
                <Breadcrumb.Separator />
                <Breadcrumb.Item>
                    <Breadcrumb.Link current>Current</Breadcrumb.Link>
                </Breadcrumb.Item>
            </Breadcrumb.List>
        </Breadcrumb.Root>
    );
}
