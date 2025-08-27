import type { InferPageType } from 'fumadocs-core/source';
import { loader } from 'fumadocs-core/source';

import { blocks, docs } from '~/.source';

export const source = loader({
    baseUrl: '/docs',
    source: docs.toFumadocsSource(),
});

export const blockSource = loader({
    baseUrl: '/blocks',
    source: blocks.toFumadocsSource(),
});
export type Page = InferPageType<typeof source>;
