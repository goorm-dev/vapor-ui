import { DocsBody, DocsPage } from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';

import { DocsPageHeader } from '~/components/docs-page-header';
import { getComponentOgImageUrl } from '~/constants/image-urls';
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
            <DocsPageHeader
                title={page.data.title}
                description={page.data.description}
                markdownUrl={`${page.url}.mdx`}
            />
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

    const image = getComponentOgImageUrl(slug[slug.length - 1]);

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
