import { Alert, Badge } from '@goorm-dev/vapor-core';
import { Text } from '@vapor-ui/core';

export const Component = () => (
    <>
        <Alert color="primary">Alert message</Alert>
        <Badge color="primary">Badge</Badge>
        <Text>Some text</Text>
    </>
);
