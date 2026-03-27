import type { InferPageType } from 'fumadocs-core/source';
import { remarkInclude } from 'fumadocs-mdx/config';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';

import type { source } from '~/lib/source';
import { replaceBlockDoc } from '~/utils/get-blocks-examples-doc';
import { replaceComponentDoc } from '~/utils/get-component-doc';
import { replaceFoundationDoc } from '~/utils/get-foundation-doc';
import { replaceIconDoc } from '~/utils/get-icon-doc';

const processor = remark().use(remarkMdx).use(remarkInclude).use(remarkGfm);

type ContentType = 'docs' | 'theme';

function processContent(content: string, contentType: ContentType): string {
    const baseContent = replaceFoundationDoc(replaceIconDoc(content));

    if (contentType === 'theme') {
        return baseContent;
    }

    return replaceBlockDoc(replaceComponentDoc(baseContent));
}

function getSourceUrl(fullPath: string): string {
    const marker = 'apps/website/content/';
    const idx = fullPath.indexOf(marker);
    const relativePath = idx !== -1 ? fullPath.slice(idx) : fullPath;
    return `https://raw.githubusercontent.com/goorm-dev/vapor-ui/refs/heads/main/${relativePath}`;
}

export async function getLLMText(
    page: InferPageType<typeof source>,
    contentType: ContentType = 'docs',
): Promise<string> {
    try {
        const rawContent = await page.data.getText('raw');
        const content = processContent(rawContent, contentType);
        const sourceUrl = getSourceUrl(page.data.info.fullPath);
        const processed = await processor.process({
            path: page.data.info.fullPath,
            value: content,
        });

        return `# ${page.data.title}
URL: ${page.url}
Source: ${sourceUrl}

${page.data.description}

${processed.value}`;
    } catch (error) {
        console.error(`Error processing page ${page.url}:`, error);
        const sourceUrl = getSourceUrl(page.data.info.fullPath);

        return `# ${page.data.title}
URL: ${page.url}
Source: ${sourceUrl}

${page.data.description}

> ⚠️ Error processing content: ${(error as Error).message}`;
    }
}
