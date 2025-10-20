import { Text } from '@vapor-ui/core';
import { Breadcrumb } from '@goorm-dev/vapor-core';

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
