import { notFound } from 'next/navigation';

import { DocsPageHeader } from '~/components/docs-page-header';
import { CustomDocsPage, DocsBody } from '~/components/fumadocs/docs-page';
import { SITE_URL } from '~/constants/domain';
import { source } from '~/lib/source';
import { getMDXComponents } from '~/mdx-components';
import { generatePageMetadata } from '~/utils/metadata';

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
    const { slug = [] } = await params;

    const page = source.getPage(slug);
    if (!page) notFound();

    const { body: MDX, toc } = await page.data.load();
    return (
        <CustomDocsPage
            toc={toc}
            full={page.data.full}
            tableOfContent={{
                style: 'clerk',
                single: false,
            }}
            breadcrumb={{ enabled: false }}
        >
            <DocsPageHeader
                title={page.data.title}
                description={page.data.description}
                markdownUrl={`${SITE_URL}${page.url}.mdx`}
            />
            <DocsBody>
                <MDX components={getMDXComponents({})} />
            </DocsBody>
        </CustomDocsPage>
    );
}

export async function generateStaticParams() {
    return source.generateParams();
}

export async function generateMetadata(props: { params: Promise<{ slug?: string[] }> }) {
    const { slug = [] } = await props.params;

    const page = source.getPage(slug);
    return generatePageMetadata(page || null);
}
