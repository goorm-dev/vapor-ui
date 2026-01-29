import { DocsBody, DocsPage } from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';

import { DocsPageHeader } from '~/components/docs-page-header';
import { getComponentOgImageUrl } from '~/constants/image-urls';
import { source } from '~/lib/source';
import { getMDXComponents } from '~/mdx-components';
import { createMetadata } from '~/utils/metadata';

const page = async ({ params }: { params: Promise<{ slug?: string[]; lang: string }> }) => {
    const { slug = [], lang } = await params;

    const page = source.getPage(['components', ...slug], lang);

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
            article={{
                className: 'gap-v-500',
            }}
            breadcrumb={{
                enabled: false,
            }}
        >
            <DocsPageHeader
                title={page.data.title}
                description={page.data.description}
                markdownUrl={`${page.url}.mdx`}
            />
            <DocsBody className="px-0 flex flex-col">
                <MDX components={getMDXComponents({})} />
            </DocsBody>
        </DocsPage>
    );
};

export default page;

export async function generateMetadata(props: { params: Promise<{ slug?: string[]; lang: string }> }) {
    const { slug = [], lang } = await props.params;
    const page = source.getPage(['components', ...slug], lang);
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

export async function generateStaticParams() {
    const params = source.generateParams();
    return params
        .filter((param) => param.slug?.[0] === 'components')
        .map((param) => ({
            slug: param.slug?.slice(1) || [],
        }));
}
