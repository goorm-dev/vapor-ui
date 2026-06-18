import type { MetadataRoute } from 'next';

import { SITE_URL } from '~/constants/domain';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/preview/',
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
