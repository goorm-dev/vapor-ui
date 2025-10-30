// @ts-nocheck
import { Alert } from '@goorm-dev/vapor-core';

export const Component = () => (
    <Alert asChild color="success" className="custom-class">
        <article className="article-class">Article content</article>
    </Alert>
);
