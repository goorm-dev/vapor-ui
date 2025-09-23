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

function processContent(content: string, contentType: 'docs' | 'blocks'): string {
    const baseContent = replaceFoundationDoc(replaceIconDoc(content));

    if (contentType === 'blocks') {
        return replaceBlockDoc(replaceComponentDoc(baseContent));
    }

    return replaceComponentDoc(baseContent);
}
function getSourceUrl(contentType: 'docs' | 'blocks', path: string): string {
    return `https://raw.githubusercontent.com/goorm-dev/vapor-ui/refs/heads/main/apps/website/content/${contentType}/${path}`;
}

export async function getLLMText(
    page: InferPageType<typeof source>,
    contentType: 'docs' | 'blocks' = 'docs',
): Promise<string> {
    try {
        const content = processContent(page.data.content ?? '', contentType);
        const sourceUrl = getSourceUrl(contentType, page.path);

        const processed = await processor.process({
            path: page.data._file.absolutePath,
            value: content,
        });

        return `# ${page.data.title}
URL: ${page.url}
Source: ${sourceUrl}

${page.data.description}

${processed.value}`;
    } catch (error) {
        console.error(`Error processing page ${page.url}:`, error);
        const sourceUrl = getSourceUrl(contentType, page.path);

        return `# ${page.data.title}
URL: ${page.url}
Source: ${sourceUrl}

${page.data.description}

> ⚠️ Error processing content: ${(error as Error).message}`;
    }
}
