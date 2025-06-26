import { DocsBody, DocsPage, DocsTitle } from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';

import DocsDescription from '~/components/ui/docs-description';
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
            </div>
            <DocsBody className="px-0">
                <MDX components={getMDXComponents({})} />
            </DocsBody>
        </DocsPage>
    );
};

export default page;
