import type { InferPageType } from 'fumadocs-core/source';
import { loader } from 'fumadocs-core/source';

import { blocks, docs } from '~/.source';
import { i18n } from '~/lib/i18n';

export const source = loader({
    i18n,
    baseUrl: '/docs',
    source: docs.toFumadocsSource(),
});

export const blockSource = loader({
    i18n,
    baseUrl: '/blocks',
    source: blocks.toFumadocsSource(),
});

export type Page = InferPageType<typeof source>;
