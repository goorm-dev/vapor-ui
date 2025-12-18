// @ts-nocheck
import { Text } from '@goorm-dev/vapor-core';

export const Component = () => (
    <>
        <Text color="text-primary" align="center">
            Centered Text
        </Text>
        <Text color="text-secondary" align="left">
            Left Text
        </Text>
        <Text as="p" color="text-primary">
            Paragraph Text
        </Text>
        <Text as="span">Span Text</Text>
        <Text align="right">Right Text</Text>
    </>
);
