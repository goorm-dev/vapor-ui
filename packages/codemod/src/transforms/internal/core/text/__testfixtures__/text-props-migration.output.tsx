// @ts-nocheck

import { Text } from '@vapor-ui/core';

export const Component = () => (
    <>
        <Text foreground="text-primary">Centered Text</Text>
        <Text foreground="text-secondary">Left Text</Text>
        <Text render={<p />} foreground="text-primary">
            Paragraph Text
        </Text>
        <Text render={<span />}>Span Text</Text>
        <Text>Right Text</Text>
    </>
);
