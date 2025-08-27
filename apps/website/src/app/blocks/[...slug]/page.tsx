import { notFound } from 'next/navigation';

import { BlockPageBody } from '~/components/block-page-body';
import { BlockPageHeader } from '~/components/block-page-header';
import { createMetadata } from '~/lib/metadata';
import { blockSource } from '~/lib/source';
import { getMDXComponents } from '~/mdx-components';

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
    const { slug = [] } = await params;

    const page = blockSource.getPage(slug);

    if (!page) notFound();

    const { body: MDX, toc } = await page.data.load();
    return (
        <>
            <BlockPageHeader
                title={page.data.title}
                description={page.data.description}
                previewImageUrl={page.data.previewImageUrl}
            />
            <BlockPageBody toc={toc}>
                <MDX components={getMDXComponents({})} />
            </BlockPageBody>
        </>
    );
}

export async function generateStaticParams() {
    const params = blockSource.generateParams();
    // components 경로는 제외
    return params;
}

export async function generateMetadata(props: { params: Promise<{ slug?: string[] }> }) {
    const { slug = [] } = await props.params;

    console.log(slug);
    const page = blockSource.getPage(slug);
    if (!page) notFound();
    const image = 'https://statics.goorm.io/gds/docs/og-image/logo/og-vapor-1.png';
    return createMetadata({
        title: `${page.data.title} - Vapor UI`,
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
