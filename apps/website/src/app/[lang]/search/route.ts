import { structure } from 'fumadocs-core/mdx-plugins';
import { createSearchAPI } from 'fumadocs-core/search/server';

import { source } from '~/lib/source';

export const { GET } = createSearchAPI('advanced', {
    indexes: source.getPages().map((page) => ({
        id: page.url,
        url: page.url,
        title: page.data.title ?? '',
        description: page.data.description,
        structuredData: structure(page.data.content),
    })),
});
