// @ts-nocheck
import { Alert } from '@goorm-dev/vapor-core';
import { Callout, Text } from '@vapor-ui/core';

export const Component = () => (
    <>
        <Alert color="primary">Alert message</Alert>
        <Callout.Root color="success">Already using Callout</Callout.Root>
        <Text>Some text</Text>
    </>
);
