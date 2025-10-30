import { Breadcrumb } from '@vapor-ui/core';

export default function App() {
    return (
        <Breadcrumb.Root size="sm">
            <Breadcrumb.List>
                <Breadcrumb.Item>
                    <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
                </Breadcrumb.Item>
            </Breadcrumb.List>
        </Breadcrumb.Root>
    );
}
