import type { InferPageType } from 'fumadocs-core/source';
import { remarkInclude } from 'fumadocs-mdx/config';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';

import type { source } from '~/lib/source';
import { replaceComponentDoc } from '~/utils/get-component-doc';
import { replaceFoundationDoc } from '~/utils/get-foundation-doc';
import { replaceIconDoc } from '~/utils/get-icon-doc';

const processor = remark().use(remarkMdx).use(remarkInclude).use(remarkGfm);

export async function getLLMText(page: InferPageType<typeof source>) {
    try {
        const content = replaceComponentDoc(
            replaceFoundationDoc(replaceIconDoc(page.data.content ?? '')),
        );

        const processed = await processor.process({
            path: page.data._file.absolutePath,
            value: content,
        });

        return `# ${page.data.title}
URL: ${page.url}
Source: https://raw.githubusercontent.com/goorm-dev/vapor-ui/refs/heads/main/apps/website/content/docs/${page.path}

${page.data.description}

${processed.value}`;
    } catch (error) {
        console.error(`Error processing page ${page.url}:`, error);
        return `# ${page.data.title}
URL: ${page.url}
Source: https://raw.githubusercontent.com/goorm-dev/vapor-ui/refs/heads/main/apps/website/content/docs/${page.path}

${page.data.description}

> ⚠️ Error processing content: ${(error as Error).message}`;
    }
}
