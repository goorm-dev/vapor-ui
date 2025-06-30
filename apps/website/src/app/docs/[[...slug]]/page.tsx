import { DocPageClient } from './doc-page-client';
import { DocsBody, DocsPage, DocsTitle } from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';

import DocsDescription from '~/components/ui/docs-description';
import { source } from '~/lib/source';
import { getMDXComponents } from '~/mdx-components';

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
    const { slug = [] } = await params;
    const page = source.getPage(slug);
    if (!page) notFound();

    const { body: MDX, toc, lastModified } = await page.data.load();

    return (
        <DocPageClient>
            <DocsPage
                toc={toc}
                full={page.data.full}
                tableOfContent={{
                    style: 'clerk',
                    single: false,
                }}
                lastUpdate={lastModified}
            >
                <div>
                    <DocsTitle className="mb-2">{page.data.title}</DocsTitle>
                    <DocsDescription>{page.data.description}</DocsDescription>
                </div>
                <DocsBody>
                    <MDX components={getMDXComponents({})} />
                </DocsBody>
            </DocsPage>
        </DocPageClient>
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
