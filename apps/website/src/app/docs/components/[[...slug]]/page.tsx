import { Button } from '@vapor-ui/core';
import { CopyAsMarkdownOutlineIcon } from '@vapor-ui/icons';
import { DocsBody, DocsPage } from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';

import DocsDescription from '~/components/docs-description';
import DocsTitle from '~/components/docs-title';
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
            article={{
                className: 'gap-[var(--vapor-size-space-500)]',
            }}
            breadcrumb={{
                enabled: false,
            }}
        >
            <div className="flex flex-col items-start gap-[var(--vapor-size-space-250)]">
                <div className="flex flex-col items-start gap-[var(--vapor-size-space-100)] self-stretch">
                    <DocsTitle>{page.data.title}</DocsTitle>
                    <DocsDescription>{page.data.description}</DocsDescription>
                </div>
                {/* TODO : Change this button when copy markdown component is ready */}
                <Button variant="outline" color="secondary" size="lg">
                    <CopyAsMarkdownOutlineIcon />
                    Copy as Markdown
                </Button>
            </div>
            <DocsBody className="px-0 flex flex-col">
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
