// @ts-nocheck

import { Text } from '@vapor-ui/core';

export const Component = () => (
    <>
        <Text foreground="primary-100">Centered Text</Text>
        <Text foreground="secondary-100">Left Text</Text>
        <Text render={<p />} foreground="primary-100">
            Paragraph Text
        </Text>
        <Text render={<span />}>Span Text</Text>
        <Text>Right Text</Text>
    </>
);
