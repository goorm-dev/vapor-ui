import { kebabCase } from 'es-toolkit';
import { join, relative } from 'node:path';

import { FigmaClient } from './figma/client.ts';
import { extractPreview } from './figma/code-connect.ts';
import { downloadWebpImages } from './figma/images.ts';
import {
    type FigmaNode,
    type Item,
    type ItemBlock,
    SECTION_SLUG,
    type Section,
    type SectionTitle,
} from './model.ts';
import { buildCaseBlock } from './parse/case.ts';
import { resolveComponentMeta } from './parse/header.ts';
import { parseItemChildren } from './parse/item-children.ts';
import { findItems } from './parse/items.ts';
import { discoverSections, sortByPolicy } from './parse/sections.ts';
import { renderTableForm } from './parse/table.ts';
import { prepareOutputs, writeComponentMdx } from './render/io.ts';
import { renderMdx } from './render/mdx.ts';
import { findExportFrame } from './traverse.ts';

export interface ExtractOptions {
    fileKey: string;
    nodeId: string;
    contentRoot: string;
    publicRoot: string;
    docsRoot: string;
    slugOverride?: string;
    clean: boolean;
    force: boolean;
    only?: SectionTitle[];
    token: string;
}

export interface ExtractResult {
    slug: string;
    mdxPath: string;
    publicDir: string;
    componentDir: string;
    demoFiles: string[];
    warnings: string[];
}

const pad = (n: number): string => n.toString().padStart(2, '0');

export async function extract(opts: ExtractOptions): Promise<ExtractResult> {
    const client = new FigmaClient(opts.token);

    console.log(`문서 추출을 시작합니다. ${opts.clean ? '(clean mode)' : ''}\n`);

    const canvas = await client.getNode(opts.fileKey, opts.nodeId);
    const canvasName = canvas.name.trim();
    const slug = opts.slugOverride ?? kebabCase(canvasName);
    const warnings: string[] = [];
    const only = opts.only ? new Set<SectionTitle>(opts.only) : undefined;

    const contentFile = join(opts.contentRoot, slug, 'index.mdx');
    const publicDir = join(opts.publicRoot, slug);
    const componentDir = join(opts.contentRoot, slug);
    await prepareOutputs(contentFile, publicDir, opts.clean);

    const { title: docTitle, description: docDescription } = resolveComponentMeta(
        canvas,
        canvasName,
        warnings,
    );

    const discovered = discoverSections(canvas, warnings, only);

    console.log(`발견된 섹션: ${discovered.length}개`);
    console.log(discovered.map((d) => `- ${d.title}\n`).join(''));
    console.log('내용을 분석하고 있습니다...\n');

    const demoFiles: string[] = [];
    const sections: Section[] = [];
    for (const { title, frame } of discovered) {
        const sectionSlug = SECTION_SLUG[title];
        const itemNodes = findItems(frame);
        const items: Item[] = [];
        for (let idx = 0; idx < itemNodes.length; idx++) {
            const processed = await processItem({
                sectionTitle: title,
                sectionSlug,
                idx,
                itemNode: itemNodes[idx]!,
                docTitle,
                client,
                fileKey: opts.fileKey,
                publicDir,
                componentDir,
                docsRoot: opts.docsRoot,
                force: opts.force,
                warnings,
            });
            items.push({ blocks: processed.blocks });
            demoFiles.push(...processed.absDemoFiles);
        }
        sections.push({ title, slug: sectionSlug, items });
    }

    const sorted = sortByPolicy(sections);

    console.log(`총 ${sorted.length}개의 프레임을 마크다운으로 변환합니다...\n`);

    const mdx = renderMdx({
        slug,
        title: docTitle,
        description: docDescription,
        sections: sorted,
    });
    await writeComponentMdx(contentFile, mdx);

    console.log(`컴포넌트 문서가 작성되었습니다!`);
    console.log(contentFile + '\n');

    return { slug, mdxPath: contentFile, publicDir, componentDir, demoFiles, warnings };
}

interface ItemContext {
    sectionTitle: SectionTitle;
    sectionSlug: string;
    idx: number;
    itemNode: FigmaNode;
    docTitle: string;
    client: FigmaClient;
    fileKey: string;
    publicDir: string;
    componentDir: string;
    docsRoot: string;
    force: boolean;
    warnings: string[];
}

async function processItem(
    ctx: ItemContext,
): Promise<{ blocks: ItemBlock[]; absDemoFiles: string[] }> {
    const baseName = `${ctx.sectionSlug}-${pad(ctx.idx + 1)}`;
    const children = parseItemChildren(ctx.itemNode);
    const sampleCount = children.filter((c) => c.kind === 'sample').length;

    const blocks: ItemBlock[] = [];
    const absDemoFiles: string[] = [];
    let currentSubtitle = '';
    let sampleIdx = 0;

    for (const child of children) {
        switch (child.kind) {
            case 'subtitle':
                currentSubtitle = child.text;
                blocks.push({ kind: 'subtitle', text: child.text });
                break;
            case 'body':
                blocks.push({ kind: 'body', text: child.text });
                break;
            case 'listItem':
                blocks.push({ kind: 'listItem', markdown: child.markdown });
                break;
            case 'listGroup':
                blocks.push({ kind: 'listGroup', items: child.items });
                break;
            case 'sample': {
                sampleIdx += 1;
                const block = await handleSample({
                    ctx,
                    sampleNode: child.node,
                    baseName,
                    sampleCount,
                    sampleIdx,
                    currentSubtitle,
                });
                if (block) blocks.push(block);
                break;
            }
            case 'preview': {
                const { block, absDemoFile } = await handlePreview({
                    ctx,
                    previewSlot: child.node,
                    baseName,
                });
                absDemoFiles.push(absDemoFile);
                blocks.push(block);
                break;
            }
            case 'table': {
                const block = handleTable({ ctx, tableNode: child.node });
                if (block) blocks.push(block);
                break;
            }
            case 'doCase':
            case 'dontCase': {
                const block = await handleCase({
                    ctx,
                    caseFrame: child.node,
                    variant: child.kind === 'doCase' ? 'do' : 'dont',
                    baseName,
                });
                if (block) blocks.push(block);
                break;
            }
        }
    }

    return { blocks, absDemoFiles };
}

async function handleSample(args: {
    ctx: ItemContext;
    sampleNode: FigmaNode;
    baseName: string;
    sampleCount: number;
    sampleIdx: number;
    currentSubtitle: string;
}): Promise<Extract<ItemBlock, { kind: 'docsImage' }> | undefined> {
    const { ctx, sampleNode, baseName, sampleCount, sampleIdx, currentSubtitle } = args;
    const sampleBaseName = sampleCount > 1 ? `${baseName}-${pad(sampleIdx)}` : baseName;
    const locator = sampleLocator(ctx.sectionTitle, ctx.idx, sampleCount, sampleIdx);

    const exportFrame = findExportFrame(sampleNode);
    const targetNode = exportFrame ?? sampleNode;
    if (!exportFrame) {
        ctx.warnings.push(
            `${locator}: Export frame missing, used Sample fallback (${sampleNode.id})`,
        );
    }

    const webpRel = await downloadWebpImages(
        ctx.client,
        ctx.fileKey,
        [{ nodeId: targetNode.id, baseName: sampleBaseName }],
        ctx.publicDir,
    );
    const rel = webpRel[targetNode.id];
    if (!rel) {
        ctx.warnings.push(`${locator}: export failed (${targetNode.id})`);
        return undefined;
    }

    const alt = resolveSampleAlt(
        ctx.sectionTitle,
        ctx.docTitle,
        sampleCount,
        sampleIdx,
        currentSubtitle,
    );
    return { kind: 'docsImage', webpRel: rel, alt };
}

function sampleLocator(
    sectionTitle: SectionTitle,
    itemIdx: number,
    sampleCount: number,
    sampleIdx: number,
): string {
    const prefix = `${sectionTitle} / item ${itemIdx + 1} / sample`;
    return sampleCount > 1 ? `${prefix} ${sampleIdx}` : prefix;
}

function resolveSampleAlt(
    sectionTitle: SectionTitle,
    docTitle: string,
    sampleCount: number,
    sampleIdx: number,
    currentSubtitle: string,
): string {
    if (sectionTitle !== 'Anatomy') return currentSubtitle;
    return sampleCount > 1 ? `${docTitle} 아나토미 구조 ${sampleIdx}` : `${docTitle} 아나토미 구조`;
}

async function handlePreview(args: {
    ctx: ItemContext;
    previewSlot: FigmaNode;
    baseName: string;
}): Promise<{ block: Extract<ItemBlock, { kind: 'demo' }>; absDemoFile: string }> {
    const { ctx, previewSlot, baseName } = args;
    const absDemoFile = join(ctx.componentDir, 'demos', `${baseName}.tsx`);
    const demoRef = relative(ctx.docsRoot, absDemoFile);
    const result = await extractPreview({
        fileKey: ctx.fileKey,
        previewSlot,
        componentDir: ctx.componentDir,
        baseName,
        demoRef,
        force: ctx.force,
        warnings: ctx.warnings,
    });
    return {
        block: {
            kind: 'demo',
            file: result.file,
            placeholder: result.placeholder,
            nodeId: result.nodeId,
        },
        absDemoFile,
    };
}

function handleTable(args: {
    ctx: ItemContext;
    tableNode: FigmaNode;
}): Extract<ItemBlock, { kind: 'table' }> | undefined {
    const { ctx, tableNode } = args;
    const locator = `${ctx.sectionTitle} / item ${ctx.idx + 1} / table`;
    const md = renderTableForm(tableNode, ctx.warnings, locator);
    return md ? { kind: 'table', markdown: md } : undefined;
}

async function handleCase(args: {
    ctx: ItemContext;
    caseFrame: FigmaNode;
    variant: 'do' | 'dont';
    baseName: string;
}): Promise<Extract<ItemBlock, { kind: 'doCase' | 'dontCase' }> | undefined> {
    const { ctx, caseFrame, variant, baseName } = args;
    return buildCaseBlock({
        client: ctx.client,
        fileKey: ctx.fileKey,
        caseFrame,
        variant,
        baseName: `${baseName}-${variant}`,
        publicDir: ctx.publicDir,
        warnings: ctx.warnings,
        locator: `${ctx.sectionTitle} / item ${ctx.idx + 1} / ${variant}`,
    });
}
