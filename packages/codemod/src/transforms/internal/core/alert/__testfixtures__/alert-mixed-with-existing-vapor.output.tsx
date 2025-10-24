import { Badge } from '@goorm-dev/vapor-core';
import { Text, Callout } from '@vapor-ui/core';

export const Component = () => (
    <>
        <Callout.Root color="primary">Alert message</Callout.Root>
        <Badge color="primary">Badge</Badge>
        <Text>Some text</Text>
    </>
);
