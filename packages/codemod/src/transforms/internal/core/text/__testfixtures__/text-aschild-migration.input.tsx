// @ts-nocheck
import { Text } from '@goorm-dev/vapor-core';

export const Component = () => (
    <>
        <Text asChild typography="heading1">
            <h1>h1 태그를 사용합니다.</h1>
        </Text>
        <Text asChild typography="body1">
            <p className="custom">Paragraph with class</p>
        </Text>
        <Text asChild>
            <a href="/link">Link text</a>
        </Text>
    </>
);
