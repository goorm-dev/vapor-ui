import { Breadcrumb } from '@goorm-dev/vapor-core';

export default function App() {
    return (
        <Breadcrumb size="xs">
            <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        </Breadcrumb>
    );
}
