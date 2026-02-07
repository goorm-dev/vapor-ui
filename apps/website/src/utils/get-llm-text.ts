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

import { getAppVersion } from './get-app-version';

const processor = remark().use(remarkMdx).use(remarkInclude).use(remarkGfm);

type ContentType = 'docs' | 'blocks' | 'theme';

function processContent(content: string, contentType: ContentType): string {
    const baseContent = replaceFoundationDoc(replaceIconDoc(content));

    if (contentType === 'blocks') {
        return replaceBlockDoc(replaceComponentDoc(baseContent));
    }

    if (contentType === 'theme') {
        return baseContent;
    }

    return replaceComponentDoc(baseContent);
}
function getSourceUrl(contentType: ContentType, path: string): string {
    return `https://raw.githubusercontent.com/goorm-dev/vapor-ui/refs/heads/main/apps/website/content/${contentType}/${path}`;
}

export async function getLLMText(
    page: InferPageType<typeof source>,
    contentType: ContentType = 'docs',
): Promise<string> {
    try {
        const content = processContent(page.data.content ?? '', contentType);
        const sourceUrl = getSourceUrl(contentType, page.path);
        const appVersion = await getAppVersion();
        const processed = await processor.process({
            path: page.data._file.absolutePath,
            value: content,
        });

        return `---
version: ${appVersion}
---
# ${page.data.title}
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
