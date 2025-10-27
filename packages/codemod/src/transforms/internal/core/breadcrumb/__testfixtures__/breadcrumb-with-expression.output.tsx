//@ts-nocheck
import { Breadcrumb } from '@vapor-ui/core';

export default function App() {
    const isActive = true;
    return (
        <Breadcrumb.Root size="md">
            <Breadcrumb.List>
                <Breadcrumb.Item>
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
