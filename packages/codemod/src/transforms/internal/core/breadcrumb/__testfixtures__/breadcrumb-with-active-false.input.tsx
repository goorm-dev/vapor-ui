//@ts-nocheck
import { Breadcrumb } from '@goorm-dev/vapor-core';

export default function App() {
    return (
        <Breadcrumb>
            <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/docs" active={false}>
                Docs
            </Breadcrumb.Item>
            <Breadcrumb.Item active>Current</Breadcrumb.Item>
        </Breadcrumb>
    );
}
