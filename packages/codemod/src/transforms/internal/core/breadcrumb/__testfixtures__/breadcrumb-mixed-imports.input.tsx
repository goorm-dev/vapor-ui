import { Breadcrumb, Button } from '@goorm-dev/vapor-core';

export default function App() {
    return (
        <>
            <Breadcrumb size="md">
                <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
            </Breadcrumb>
            <Button>Click me</Button>
        </>
    );
}
