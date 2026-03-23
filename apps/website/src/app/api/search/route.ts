import { structure } from 'fumadocs-core/mdx-plugins';
import { createSearchAPI } from 'fumadocs-core/search/server';

import { source } from '~/lib/source';

export const { GET } = createSearchAPI('advanced', {
    indexes: async () => {
        const items = source.getPages().map(async (page) => {
            const { url, data } = page;
            const { title = '', description, getText } = data;
            const raw = await getText('raw');

            return { id: url, url, title, description, structuredData: structure(raw) };
        });

        const settled = await Promise.allSettled(items);
        return settled.filter((item) => item.status === 'fulfilled').map((item) => item.value);
    },
});
