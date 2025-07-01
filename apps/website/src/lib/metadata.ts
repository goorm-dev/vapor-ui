import type { Metadata } from 'next';

export function createMetadata(override: Metadata): Metadata {
    return {
        ...override,
        title: override.title ?? {
            template: '%s - Vapor UI',
            default: 'Vapor UI',
        },
        openGraph: {
            ...override.openGraph,
            title: override.title ?? override.openGraph?.title ?? 'Vapor UI',
            description:
                override.description ??
                override.openGraph?.description ??
                'Vapor UI is a modern, flexible and accessible design system for building beautiful and accessible web applications.',
            siteName: override.openGraph?.siteName ?? 'Vapor UI',
            images:
                override.openGraph?.images ??
                'https://statics.goorm.io/gds/docs/og-image/logo/og-vapor-1.png',
        },
        twitter: {
            ...override.twitter,
            creator: override.twitter?.creator ?? '@goorm-dev',
            title: override.title ?? override.twitter?.title ?? 'Vapor UI',
            description:
                override.description ??
                override.twitter?.description ??
                'Vapor UI is a modern, flexible and accessible design system for building beautiful and accessible web applications.',
            images:
                override.twitter?.images ??
                'https://statics.goorm.io/gds/docs/og-image/logo/og-vapor-1.png',
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
