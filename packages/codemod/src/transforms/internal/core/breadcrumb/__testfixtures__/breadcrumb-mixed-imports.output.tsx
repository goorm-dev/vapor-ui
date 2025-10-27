import { Button } from '@goorm-dev/vapor-core';
import { Breadcrumb } from '@vapor-ui/core';

export default function App() {
    return (
        <>
            <Breadcrumb.Root size="md">
                <Breadcrumb.List>
                    <Breadcrumb.Item>
                        <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
                    </Breadcrumb.Item>
                </Breadcrumb.List>
            </Breadcrumb.Root>
            <Button>Click me</Button>
        </>
    );
}
