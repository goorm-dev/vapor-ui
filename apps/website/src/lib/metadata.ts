import type { Metadata } from 'next';

export function createMetadata(override: Metadata): Metadata {
    return {
        ...override,
        title: override.title ?? {
            template: '%s - Vapor UI',
            default: 'Vapor UI',
        },
        openGraph: {
            title: override.title ?? 'Vapor UI',
            description:
                override.description ??
                'Vapor UI is a modern, flexible and accessible design system for building beautiful and accessible web applications.',
            siteName: 'Vapor UI',
            images:
                override.openGraph?.images ??
                'https://statics.goorm.io/gds/docs/og-image/logo/og-vapor-1.png',
            ...override.openGraph,
        },
        twitter: {
            card: 'summary_large_image',
            creator: '@goorm-dev',
            title: override.title ?? 'Vapor UI',
            description:
                override.description ??
                'Vapor UI is a modern, flexible and accessible design system for building beautiful and accessible web applications.',
            images:
                override.twitter?.images ??
                'https://statics.goorm.io/gds/docs/og-image/logo/og-vapor-1.png',
            ...override.twitter,
        },
        alternates: {
            types: {
                'application/rss+xml': [
                    {
                        title: 'Vapor UI',
                        url: 'https://vapor.goorm.io',
                    },
                ],
            },
            ...override.alternates,
        },
    };
}
