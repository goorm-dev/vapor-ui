//@ts-nocheck
import { Breadcrumb } from '@goorm-dev/vapor-core';

export default function App() {
    return (
        <Breadcrumb size="md">
            <Breadcrumb.Item href="/" className="custom">
                Home
            </Breadcrumb.Item>
            <Breadcrumb.Item active>Current</Breadcrumb.Item>
        </Breadcrumb>
    );
}
