import { Breadcrumb } from '@vapor-ui/core';

export default function App() {
    return (
        <Breadcrumb.Root>
            <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item href="/docs">Docs</Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item current>Current</Breadcrumb.Item>
        </Breadcrumb.Root>
    );
}
