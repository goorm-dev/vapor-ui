import { notFound } from 'next/navigation';

import { BlockPageBody } from '~/components/block-page-body';
import { BlockPageHeader } from '~/components/block-page-header';
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

