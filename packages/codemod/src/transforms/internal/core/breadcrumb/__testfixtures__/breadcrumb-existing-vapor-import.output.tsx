import { Text, Breadcrumb } from '@vapor-ui/core';

export default function App() {
    return (
        <>
            <Text>Welcome</Text>
            <Breadcrumb.Root size="lg">
                <Breadcrumb.List>
                    <Breadcrumb.Item>
                        <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
                    </Breadcrumb.Item>
                </Breadcrumb.List>
            </Breadcrumb.Root>
        </>
    );
}
