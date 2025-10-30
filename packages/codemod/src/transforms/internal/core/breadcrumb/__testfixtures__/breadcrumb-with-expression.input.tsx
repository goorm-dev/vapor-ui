//@ts-nocheck
import { Breadcrumb } from '@goorm-dev/vapor-core';

export default function App() {
    const isActive = true;
    return (
        <Breadcrumb size="md">
            <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
            <Breadcrumb.Item active={isActive}>Current</Breadcrumb.Item>
        </Breadcrumb>
    );
}
