import { Breadcrumb } from '@vapor-ui/core';

export default function App() {
    return (
        <Breadcrumb.Root size="md">
            <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item href="/docs">Docs</Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item current>Components</Breadcrumb.Item>
        </Breadcrumb.Root>
    );
}
