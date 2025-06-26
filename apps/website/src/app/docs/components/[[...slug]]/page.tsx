import fs from 'fs';
import { DocsBody, DocsPage, DocsTitle } from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';
import path from 'path';

import AccessibilityTable from '~/components/accessibility-table/accessibility-table';
import type { AccessibilityTableProps } from '~/components/accessibility-table/accessibility-table';
import DocsDescription from '~/components/ui/docs-description';
import { source } from '~/lib/source';
import { getMDXComponents } from '~/mdx-components';

const page = async ({ params }: { params: Promise<{ slug?: string[] }> }) => {
    const { slug = [] } = await params;

    const page = source.getPage(['components', ...slug]);

    if (!page) notFound();
    const { body: MDX, toc, lastModified } = await page.data.load();

    // Wrapper to preload data from /public/components/*.json synchronously
    const AccessibilityTableWrapper = (props: AccessibilityTableProps) => {
        const { file, data, ...rest } = props;
        let resolved = data;
        if (!resolved && file) {
            try {
                const filePath = path.join(process.cwd(), 'public', 'components', `${file}.json`);
                const content = fs.readFileSync(filePath, 'utf-8');
                const json = JSON.parse(content);
                resolved = (json as Record<string, unknown>)['accessibility'] ?? json;
            } catch (err) {
                console.error(`Failed to preload accessibility JSON for ${file}`, err);
            }
        }

        return <AccessibilityTable {...rest} file={file} data={resolved} />;
    };

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
                <MDX
                    components={getMDXComponents({
                        AccessibilityTable: AccessibilityTableWrapper,
                    })}
                />
            </DocsBody>
        </DocsPage>
    );
};

export default page;
