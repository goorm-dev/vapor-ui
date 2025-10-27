import { Breadcrumb } from '@goorm-dev/vapor-core';
import { Text } from '@vapor-ui/core';

export default function App() {
    return (
        <>
            <Text>Welcome</Text>
            <Breadcrumb size="lg">
                <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
            </Breadcrumb>
        </>
    );
}
