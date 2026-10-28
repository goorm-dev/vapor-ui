import { mkdir, rm } from 'node:fs/promises';
import { join, relative } from 'node:path';

import type { FigmaClient } from '../../clients/figma.ts';
import { findExportFrame } from '../../shared/traverse.ts';
import type { FigmaNode, ItemBlock, SectionTitle } from '../../shared/types.ts';
import type { AnalyzedDoc, AnalyzedSection } from '../analyzer/index.ts';
import { parseItemChildren, renderTableForm } from '../normalizer/index.ts';
import { buildCaseBlock } from './case-block.ts';
import { extractPreview } from './code-connect.ts';
import { downloadWebpImages } from './images.ts';

export interface ExtractedItem {
    blocks: ItemBlock[];
    absDemoFiles: string[];
}

export interface ExtractedSection {
    title: SectionTitle;
    slug: string;
    items: ExtractedItem[];
}

export interface ExtractedDoc {
    slug: string;
    docTitle: string;
    docDescription: string;
    sections: ExtractedSection[];
    demoFiles: string[];
    warnings: string[];
}

export interface ExtractDeps {
    client: FigmaClient;
    fileKey: string;
    publicDir: string;
    componentDir: string;
    docsRoot: string;
    force: boolean;
    clean: boolean;
    warnings: string[];
}

const pad = (n: number): string => n.toString().padStart(2, '0');

export async function extract(doc: AnalyzedDoc, deps: ExtractDeps): Promise<ExtractedDoc> {
    if (deps.clean) await rm(deps.publicDir, { recursive: true, force: true });
    await mkdir(deps.publicDir, { recursive: true });

    const sections: ExtractedSection[] = [];
    const demoFiles: string[] = [];
    for (const section of doc.sections) {
        const items: ExtractedItem[] = [];
        for (let idx = 0; idx < section.itemNodes.length; idx++) {
            const item = await processItem(section, idx, section.itemNodes[idx]!, doc, deps);
            items.push({ blocks: item.blocks, absDemoFiles: item.absDemoFiles });
            demoFiles.push(...item.absDemoFiles);
        }
        sections.push({ title: section.title, slug: section.slug, items });
    }

    return {
        slug: doc.slug,
        docTitle: doc.docTitle,
        docDescription: doc.docDescription,
        sections,
        demoFiles,
        warnings: deps.warnings,
    };
}

async function processItem(
    section: AnalyzedSection,
    idx: number,
    itemNode: FigmaNode,
    doc: AnalyzedDoc,
    deps: ExtractDeps,
): Promise<ExtractedItem> {
    const baseName = `${section.slug}-${pad(idx + 1)}`;
    const children = parseItemChildren(itemNode);
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
                    section,
                    idx,
                    doc,
                    deps,
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
                    deps,
                    previewSlot: child.node,
                    componentDir: deps.componentDir,
                    baseName,
                });
                absDemoFiles.push(absDemoFile);
                blocks.push(block);
                break;
            }
            case 'table': {
                const block = handleTable({ section, idx, deps, tableNode: child.node });
                if (block) blocks.push(block);
                break;
            }
            case 'doCase':
            case 'dontCase': {
                const block = await handleCase({
                    section,
                    idx,
                    deps,
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

interface SampleContext {
    section: AnalyzedSection;
    idx: number;
    doc: AnalyzedDoc;
    deps: ExtractDeps;
    sampleNode: FigmaNode;
    baseName: string;
    sampleCount: number;
    sampleIdx: number;
    currentSubtitle: string;
}

async function handleSample(
    ctx: SampleContext,
): Promise<Extract<ItemBlock, { kind: 'docsImage' }> | undefined> {
    const sampleBaseName =
        ctx.sampleCount > 1 ? `${ctx.baseName}-${pad(ctx.sampleIdx)}` : ctx.baseName;
    const locator = sampleLocator(ctx.section.title, ctx.idx, ctx.sampleCount, ctx.sampleIdx);

    const exportFrame = findExportFrame(ctx.sampleNode);
    const targetNode = exportFrame ?? ctx.sampleNode;
    if (!exportFrame) {
        ctx.deps.warnings.push(
            `${locator}: Export frame missing, used Sample fallback (${ctx.sampleNode.id})`,
        );
    }

    const webpRel = await downloadWebpImages(
        ctx.deps.client,
        ctx.deps.fileKey,
        [{ nodeId: targetNode.id, baseName: sampleBaseName }],
        ctx.deps.publicDir,
    );
    const rel = webpRel[targetNode.id];
    if (!rel) {
        ctx.deps.warnings.push(`${locator}: export failed (${targetNode.id})`);
        return undefined;
    }

    return {
        kind: 'docsImage',
        webpRel: rel,
        alt: resolveSampleAlt(ctx),
    };
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

function resolveSampleAlt(ctx: SampleContext): string {
    if (ctx.section.title !== 'Anatomy') return ctx.currentSubtitle;
    return ctx.sampleCount > 1
        ? `${ctx.doc.docTitle} 아나토미 구조 ${ctx.sampleIdx}`
        : `${ctx.doc.docTitle} 아나토미 구조`;
}

interface PreviewContext {
    deps: ExtractDeps;
    previewSlot: FigmaNode;
    componentDir: string;
    baseName: string;
}

async function handlePreview(ctx: PreviewContext): Promise<{
    block: Extract<ItemBlock, { kind: 'demo' }>;
    absDemoFile: string;
}> {
    const absDemoFile = join(ctx.componentDir, 'demos', `${ctx.baseName}.tsx`);
    const demoRef = relative(ctx.deps.docsRoot, absDemoFile);
    const result = await extractPreview({
        fileKey: ctx.deps.fileKey,
        previewSlot: ctx.previewSlot,
        componentDir: ctx.componentDir,
        baseName: ctx.baseName,
        demoRef,
        force: ctx.deps.force,
        warnings: ctx.deps.warnings,
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

interface TableContext {
    section: AnalyzedSection;
    idx: number;
    deps: ExtractDeps;
    tableNode: FigmaNode;
}

function handleTable(ctx: TableContext): Extract<ItemBlock, { kind: 'table' }> | undefined {
    const locator = `${ctx.section.title} / item ${ctx.idx + 1} / table`;
    const md = renderTableForm(ctx.tableNode, ctx.deps.warnings, locator);
    return md ? { kind: 'table', markdown: md } : undefined;
}

interface CaseContext {
    section: AnalyzedSection;
    idx: number;
    deps: ExtractDeps;
    caseFrame: FigmaNode;
    variant: 'do' | 'dont';
    baseName: string;
}

async function handleCase(
    ctx: CaseContext,
): Promise<Extract<ItemBlock, { kind: 'doCase' | 'dontCase' }> | undefined> {
    return buildCaseBlock({
        client: ctx.deps.client,
        fileKey: ctx.deps.fileKey,
        caseFrame: ctx.caseFrame,
        variant: ctx.variant,
        baseName: `${ctx.baseName}-${ctx.variant}`,
        publicDir: ctx.deps.publicDir,
        warnings: ctx.deps.warnings,
        locator: `${ctx.section.title} / item ${ctx.idx + 1} / ${ctx.variant}`,
    });
}
