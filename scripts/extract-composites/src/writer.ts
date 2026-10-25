import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import type { Item, ItemBlock, Section } from './types.ts';

export interface RenderInput {
    slug: string;
    title: string;
    description: string;
    sections: Section[];
}

export async function prepareOutputs(
    contentFile: string,
    publicDir: string,
    clean: boolean,
): Promise<void> {
    if (clean) {
        await rm(publicDir, { recursive: true, force: true });
        await rm(contentFile, { force: true });
    }
    await mkdir(dirname(contentFile), { recursive: true });
    await mkdir(publicDir, { recursive: true });
}

export async function writeComponentMdx(path: string, content: string): Promise<void> {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, content);
}

export function renderMdx(input: RenderInput): string {
    const parts: string[] = [];
    parts.push(renderFrontmatter(input));

    for (const section of input.sections) {
        const body = renderSection(section, input.slug);
        if (body) parts.push(body);
    }
    return parts.join('\n\n').trimEnd() + '\n';
}

function renderFrontmatter(input: RenderInput): string {
    const esc = (s: string) => s.replace(/"/g, '\\"');
    const siteName = `${input.title} - Vapor Composites`;
    return [
        '---',
        `title: "${esc(input.title)}"`,
        `description: "${esc(input.description)}"`,
        `site_name: "${esc(siteName)}"`,
        '---',
    ].join('\n');
}

function renderSection(section: Section, slug: string): string {
    const parts: string[] = [`## ${section.title}`];
    for (const item of section.items) {
        const body = renderItem(item, slug);
        if (body) parts.push(body);
    }
    if (parts.length === 1) return '';
    return parts.join('\n\n');
}

type CaseBlock = Extract<ItemBlock, { kind: 'doCase' | 'dontCase' }>;

function isCaseBlock(block: ItemBlock): block is CaseBlock {
    return block.kind === 'doCase' || block.kind === 'dontCase';
}

/** Render item blocks in order; collapse any run of consecutive do/dont case blocks
 *  into a single `<DocsGrid>` wrapper. */
function renderItem(item: Item, slug: string): string {
    const parts: string[] = [];
    let i = 0;
    while (i < item.blocks.length) {
        const block = item.blocks[i]!;
        if (isCaseBlock(block)) {
            const run: CaseBlock[] = [];
            while (i < item.blocks.length) {
                const next = item.blocks[i]!;
                if (!isCaseBlock(next)) break;
                run.push(next);
                i++;
            }
            parts.push(renderDocsGrid(run, slug));
            continue;
        }
        parts.push(renderBlock(block, slug));
        i++;
    }
    return parts.filter(Boolean).join('\n\n');
}

function renderDocsGrid(cases: CaseBlock[], slug: string): string {
    const inner = cases.map((c) => renderCaseMultiline(c, slug)).join('\n');
    return `<DocsGrid>\n${inner}\n</DocsGrid>`;
}

function renderCaseMultiline(block: CaseBlock, slug: string): string {
    const tag = block.kind === 'doCase' ? 'DoImage' : 'DontImage';
    return [
        `    <${tag}`,
        `        src="/composites/${slug}/${block.webpRel}"`,
        `        alt="${attr(block.alt)}"`,
        `        caption="${attr(block.caption)}"`,
        `    />`,
    ].join('\n');
}

function renderBlock(block: ItemBlock, slug: string): string {
    switch (block.kind) {
        case 'subtitle':
            return `### ${block.text}`;
        case 'body':
            return block.text;
        case 'docsImage':
            return `<DocsImage src="/composites/${slug}/${block.webpRel}" alt="${attr(block.alt)}" />`;
        case 'doCase':
            return `<DoImage src="/composites/${slug}/${block.webpRel}" alt="${attr(block.alt)}" caption="${attr(block.caption)}" />`;
        case 'dontCase':
            return `<DontImage src="/composites/${slug}/${block.webpRel}" alt="${attr(block.alt)}" caption="${attr(block.caption)}" />`;
        case 'demo':
            if (block.placeholder) {
                return ['```tsx', `// TODO(code-connect): figma node ${block.nodeId}`, '```'].join(
                    '\n',
                );
            }
            return `<Demo file="${block.file}" />`;
        case 'table':
            return block.markdown;
    }
}

/** Escape a value for an MDX/HTML attribute. */
function attr(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/\r?\n/g, ' ');
}
