import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { OG_IMAGE_URL } from '~/constants/image-urls';

export function createMetadata(override: Metadata): Metadata {
    return {
        ...override,
        title: override.title ?? {
            template: '%s - Vapor UI',
            default: 'Vapor UI',
        },
        description:
            override.description ??
            'Vapor UI is a modern, flexible and accessible design system for building beautiful and accessible web applications.',
        openGraph: {
            ...override.openGraph,
            title: override.title ?? override.openGraph?.title ?? 'Vapor UI',
            description:
                override.description ??
                override.openGraph?.description ??
                'Vapor UI is a modern, flexible and accessible design system for building beautiful and accessible web applications.',
            siteName: override.openGraph?.siteName ?? 'Vapor UI',
            url: override.openGraph?.url ?? 'https://vapor-ui.goorm.io',
            images: override.openGraph?.images ?? OG_IMAGE_URL,
        },
        twitter: {
            ...override.twitter,
            creator: override.twitter?.creator ?? '@goorm-dev',
            title: override.title ?? override.twitter?.title ?? 'Vapor UI',
            description:
                override.description ??
                override.twitter?.description ??
                'Vapor UI is a modern, flexible and accessible design system for building beautiful and accessible web applications.',
            images: override.twitter?.images ?? OG_IMAGE_URL,
        },
        alternates: {
            types: {
                'application/rss+xml': [
                    {
                        title: 'Vapor UI',
                        url: 'https://vapor-ui.goorm.io',
                    },
                ],
            },
            ...override.alternates,
        },
    };
}

export function generatePageMetadata(
    page: { data: { title: string; description?: string } } | null,
    title: string = 'Vapor UI',
): Metadata {
    if (!page) notFound();

    const image = OG_IMAGE_URL;

    return createMetadata({
        title: `${page.data.title} - ${title}`,
        description: page.data.description,
        openGraph: {
            images: image,
        },
        twitter: {
            card: 'summary_large_image',
            images: image,
        },
    });
}
