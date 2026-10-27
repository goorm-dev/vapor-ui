import type { InferPageType } from 'fumadocs-core/source';
import { remarkInclude } from 'fumadocs-mdx/config';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';

import type { source } from '~/lib/source';
import { replaceDemoSelfClosing } from '~/utils/get-blocks-examples-doc';
import { replaceComponentDoc } from '~/utils/get-component-doc';
import { replaceCompositeDoc } from '~/utils/get-composite-doc';
import { replaceFoundationDoc } from '~/utils/get-foundation-doc';
import { replaceIconDoc } from '~/utils/get-icon-doc';

const processor = remark().use(remarkMdx).use(remarkInclude).use(remarkGfm);

type ContentType = 'docs' | 'theme';

interface LLMTextInput {
    /** The page file as written, frontmatter included. */
    raw: string;
    title: string;
    description?: string;
    /** Site URL path, e.g. `/docs/components/button`. */
    url: string;
    /** Path under `content/<contentType>/`, e.g. `components/(components)/button/index.mdx`. */
    path: string;
    /** Absolute file path, for resolving includes. */
    fullPath: string;
    contentType: ContentType;
}

function processContent(content: string, contentType: ContentType): string {
    const steps =
        contentType === 'theme'
            ? [replaceIconDoc, replaceFoundationDoc]
            : [
                  replaceIconDoc,
                  replaceFoundationDoc,
                  replaceComponentDoc,
                  replaceDemoSelfClosing,
                  replaceCompositeDoc,
              ];

    return steps.reduce((text, step) => step(text), content);
}

function getSourceUrl(contentType: ContentType, path: string): string {
    return `https://raw.githubusercontent.com/goorm-dev/vapor-ui/refs/heads/main/apps/website/content/${contentType}/${path}`;
}

const stripFrontmatter = (raw: string) => raw.replace(/^---\n[\s\S]*?\n---\n/, '');

/**
 * Renders one page as plain markdown for LLMs: prose, demo source code and props
 * tables. Needs no Next.js or Fumadocs runtime, so the `.mdx` routes and the
 * script that packs docs into `@vapor-ui/core` share it.
 */
export async function toLLMText(input: LLMTextInput): Promise<string> {
    const { title, description, url, contentType } = input;
    const sourceUrl = getSourceUrl(contentType, input.path);
    const header = `# ${title}\nURL: ${url}\nSource: ${sourceUrl}\n\n${description ?? ''}\n\n`;

    try {
        const content = processContent(stripFrontmatter(input.raw), contentType);
        const processed = await processor.process({ path: input.fullPath, value: content });

        return header + processed.value;
    } catch (error) {
        console.error(`Error processing page ${url}:`, error);

        return `${header}> ⚠️ Error processing content: ${(error as Error).message}`;
    }
}

export async function getLLMText(
    page: InferPageType<typeof source>,
    contentType: ContentType = 'docs',
): Promise<string> {
    return toLLMText({
        raw: await page.data.getText('raw'),
        title: page.data.title ?? '',
        description: page.data.description,
        url: page.url,
        path: page.path,
        fullPath: page.data.info.fullPath,
        contentType,
    });
}
