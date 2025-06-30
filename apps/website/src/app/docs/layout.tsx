import type { ReactNode } from 'react';

import { DocPageClient } from './doc-page-client';
import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import { notFound } from 'next/navigation';

import { docsOptions } from '~/app/layout.config';
import { source } from '~/lib/source';

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <DocsLayout
            {...docsOptions}
            nav={{
                ...docsOptions.nav,
                mode: 'top',
            }}
        >
            <DocPageClient>{children}</DocPageClient>
        </DocsLayout>
    );
}

export async function generateStaticParams() {
    return source.generateParams();
}

export async function generateMetadata(props: { params: Promise<{ slug?: string[] }> }) {
    const { slug = [] } = await props.params;
    const page = source.getPage(slug);
    if (!page) notFound();

    // NOTE: 이미지 경로 수정 필요
    const image = slug.includes('vapor-core')
        ? `https://statics.goorm.io/gds/docs/og-image/components/core/${slug[slug.length - 1]}.png`
        : `https://statics.goorm.io/gds/docs/og-image/logo/og-vapor-1.png`;

    return {
        title: page.data.title,
        description: page.data.description,
        openGraph: {
            images: image,
        },
        twitter: {
            card: 'summary_large_image',
            images: image,
        },
    };
}
