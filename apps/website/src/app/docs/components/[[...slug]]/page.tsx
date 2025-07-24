import { DocsBody, DocsPage, DocsTitle } from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';

import CopyButton from '~/components/copy-button/copy-button';
import DocsDescription from '~/components/ui/docs-description';
import { createMetadata } from '~/lib/metadata';
import { source } from '~/lib/source';
import { getMDXComponents } from '~/mdx-components';

const page = async ({ params }: { params: Promise<{ slug?: string[] }> }) => {
    const { slug = [] } = await params;

    const page = source.getPage(['components', ...slug]);

    if (!page) notFound();
    const { body: MDX, toc, lastModified } = await page.data.load();

    return (
        <DocsPage
            toc={toc}
            full={page.data.full}
            tableOfContent={{
                style: 'clerk',
                single: false,
            }}
            lastUpdate={lastModified}
            footer={{
                enabled: false,
            }}
        >
            <div>
                <DocsTitle className="mb-2">{page.data.title}</DocsTitle>
                <DocsDescription>{page.data.description}</DocsDescription>
                <CopyButton markdownUrl={`${page.url}.mdx`} />
            </div>
            <DocsBody className="px-0">
                <MDX components={getMDXComponents({})} />
            </DocsBody>
        </DocsPage>
    );
};

export default page;

export async function generateMetadata(props: { params: Promise<{ slug?: string[] }> }) {
    const { slug = [] } = await props.params;
    const page = source.getPage(['components', ...slug]);
    if (!page) notFound();

    // NOTE: 이미지 경로 수정 필요
    const image = `https://statics.goorm.io/gds/docs/og-image/components/core/${slug[slug.length - 1]}.png`;

    return createMetadata({
        title: `${page.data.title} - Vapor UI`,
        description: page.data.description,
        openGraph: {
            images: image,
        },
        twitter: {
            images: image,
        },
    });
}
