// @ts-nocheck

import { Callout } from '@vapor-ui/core';

export const Component = () => (
    <Callout.Root
        render={<article className="article-class">Article content</article>}
        color="success"
        className="custom-class"
    />
);
