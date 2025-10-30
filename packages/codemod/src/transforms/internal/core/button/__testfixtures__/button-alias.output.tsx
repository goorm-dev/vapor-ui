import { Text } from '@goorm-dev/vapor-core';
import { Button as CoreButton } from '@vapor-ui/core';

export default function App() {
    return (
        <>
            <CoreButton variant="ghost">Click me</CoreButton>
            <Text>Hello</Text>
        </>
    );
}
