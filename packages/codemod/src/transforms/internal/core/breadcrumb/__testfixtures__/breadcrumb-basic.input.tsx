import { Breadcrumb } from '@goorm-dev/vapor-core';

export default function App() {
    return (
        <Breadcrumb size="md">
            <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/docs">Docs</Breadcrumb.Item>
            <Breadcrumb.Item active>Components</Breadcrumb.Item>
        </Breadcrumb>
    );
}
