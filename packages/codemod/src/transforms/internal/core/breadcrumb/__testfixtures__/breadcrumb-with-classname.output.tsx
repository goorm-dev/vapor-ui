import { Breadcrumb } from '@vapor-ui/core';

export default function App() {
    return (
        <Breadcrumb.Root size="md">
            <Breadcrumb.Item className="custom" href="/">
                Home
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item current>Current</Breadcrumb.Item>
        </Breadcrumb.Root>
    );
}
