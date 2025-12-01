import { notFound } from 'next/navigation';

import { BlockPageBody } from '~/components/block-page-body';
import { BlockPageHeader } from '~/components/block-page-header';
import { blockSource } from '~/lib/source';
import { getMDXComponents } from '~/mdx-components';

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
    const { slug = [] } = await params;
    const page = blockSource.getPage(slug);
    
    if (!page) notFound();

    const {
        data: { title, description, previewImageUrl, load },
    } = page;

    const { body: MDX, toc } = await load();
    return (
        <>
            <BlockPageHeader
                title={title}
                description={description}
                previewImageUrl={previewImageUrl}
            />
            <BlockPageBody toc={toc}>
                <MDX components={getMDXComponents({})} />
            </BlockPageBody>
        </>
    );
}

export async function generateStaticParams() {
    return blockSource.generateParams();
}
