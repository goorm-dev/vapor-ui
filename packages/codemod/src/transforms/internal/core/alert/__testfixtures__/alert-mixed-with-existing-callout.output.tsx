// @ts-nocheck
import { Badge } from '@goorm-dev/vapor-core';
import { Callout, Text } from '@vapor-ui/core';

export const Component = () => (
    <>
        <Callout.Root color="primary">Alert message</Callout.Root>
        <Badge color="primary">Badge</Badge>
        <Callout.Root color="success">Already using Callout</Callout.Root>
        <Text>Some text</Text>
    </>
);
