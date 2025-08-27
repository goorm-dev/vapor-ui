import { DocsBody, DocsPage } from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';

import { DocsPageHeader } from '~/components/docs-page-header';
import { generatePageMetadata } from '~/lib/metadata';
import { source } from '~/lib/source';
import { getMDXComponents } from '~/mdx-components';

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
    const { slug = [] } = await params;

    // components 경로는 components 전용 페이지에서 처리하도록 제외
    if (slug[0] === 'components') {
        notFound();
    }

    const page = source.getPage(slug);
    if (!page) notFound();

    const { body: MDX, toc, lastModified } = await page.data.load();
    const isRoot = slug.length === 0;
    return (
        <DocsPage
            toc={toc}
            full={page.data.full}
            tableOfContent={{
                style: 'clerk',
                single: false,
            }}
            lastUpdate={lastModified}
            article={{
                className: isRoot ? 'gap-[var(--vapor-size-space-800)]' : '',
            }}
        >
            <DocsPageHeader
                title={page.data.title}
                description={page.data.description}
                markdownUrl={`${page.url}.mdx`}
            />
            <DocsBody>
                <MDX components={getMDXComponents({})} />
            </DocsBody>
        </DocsPage>
    );
}

export async function generateStaticParams() {
    const params = source.generateParams();
    // components 경로는 제외
    return params.filter((param) => param.slug?.[0] !== 'components');
}

export async function generateMetadata(props: { params: Promise<{ slug?: string[] }> }) {
    const { slug = [] } = await props.params;

    // components 경로는 components 전용 페이지에서 처리하도록 제외
    if (slug[0] === 'components') {
        notFound();
    }

    const page = source.getPage(slug);
    return generatePageMetadata(page || null);
}
