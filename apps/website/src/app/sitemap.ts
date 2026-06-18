import type { MetadataRoute } from 'next';

import { SITE_URL } from '~/constants/domain';
import { source, themeSource } from '~/lib/source';

export const revalidate = false;

export default function sitemap(): MetadataRoute.Sitemap {
    const staticRoutes = ['', '/theme/playground'];

    const docsRoutes = source.getPages().map((page) => page.url);
    const themeRoutes = themeSource.getPages().map((page) => page.url);

    const paths = [...staticRoutes, ...docsRoutes, ...themeRoutes];

    return paths.map((path) => ({
        url: `${SITE_URL}${path}`,
    }));
}
