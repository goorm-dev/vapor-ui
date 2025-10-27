// @ts-nocheck
import { Text } from '@vapor-ui/core';

export const Component = () => (
    <>
        <Text typography="heading1" render={<h1 />}>
            h1 태그를 사용합니다.
        </Text>
        <Text typography="body1" render={<p className="custom" />}>
            Paragraph with class
        </Text>
        <Text render={<a href="/link" />}>Link text</Text>
    </>
);
