import { mkdir, rm } from 'node:fs/promises';
import { join, relative } from 'node:path';

import type { FigmaClient } from '../../clients/figma.ts';
import { findExportFrame } from '../../shared/traverse.ts';
import type { ItemBlock, SectionTitle } from '../../shared/types.ts';
import { parseItemChildren, renderTableForm } from '../normalizer/index.ts';
import type { SelectedDoc } from '../selector/index.ts';

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

export async function extract(doc: SelectedDoc, deps: ExtractDeps): Promise<ExtractedDoc> {
    if (deps.clean) await rm(deps.publicDir, { recursive: true, force: true });
    await mkdir(deps.publicDir, { recursive: true });

    const extractedSections: ExtractedSection[] = [];
    const demoFiles: string[] = [];
    for (const section of doc.sections) {
        const extractedItems: ExtractedItem[] = [];
        for (let idx = 0; idx < section.itemNodes.length; idx++) {
            const itemNode = section.itemNodes[idx]!;
            const baseName = `${section.slug}-${pad(idx + 1)}`;
            const blocks: ItemBlock[] = [];
            const absDemoFiles: string[] = [];
            let currentSubtitle = '';
            const children = parseItemChildren(itemNode);
            const sampleCount = children.filter((c) => c.kind === 'sample').length;
            let sampleIdx = 0;
            for (const child of children) {
                if (child.kind === 'subtitle') {
                    currentSubtitle = child.text;
                    blocks.push({ kind: 'subtitle', text: child.text });
                } else if (child.kind === 'body') {
                    blocks.push({ kind: 'body', text: child.text });
                } else if (child.kind === 'listItem') {
                    blocks.push({ kind: 'listItem', markdown: child.markdown });
                } else if (child.kind === 'listGroup') {
                    blocks.push({ kind: 'listGroup', items: child.items });
                } else if (child.kind === 'sample') {
                    sampleIdx++;
                    const sampleBaseName =
                        sampleCount > 1 ? `${baseName}-${pad(sampleIdx)}` : baseName;
                    const locator =
                        sampleCount > 1
                            ? `${section.title} / item ${idx + 1} / sample ${sampleIdx}`
                            : `${section.title} / item ${idx + 1} / sample`;
                    const exportFrame = findExportFrame(child.node);
                    const targetNode = exportFrame ?? child.node;
                    if (!exportFrame) {
                        deps.warnings.push(
                            `${locator}: Export frame missing, used Sample fallback (${child.node.id})`,
                        );
                    }
                    const webpRel = await downloadWebpImages(
                        deps.client,
                        deps.fileKey,
                        [{ nodeId: targetNode.id, baseName: sampleBaseName }],
                        deps.publicDir,
                    );
                    const rel = webpRel[targetNode.id];
                    if (rel) {
                        const alt =
                            section.title === 'Anatomy'
                                ? sampleCount > 1
                                    ? `${doc.docTitle} 아나토미 구조 ${sampleIdx}`
                                    : `${doc.docTitle} 아나토미 구조`
                                : currentSubtitle;
                        blocks.push({ kind: 'docsImage', webpRel: rel, alt });
                    } else {
                        deps.warnings.push(`${locator}: export failed (${targetNode.id})`);
                    }
                } else if (child.kind === 'preview') {
                    const absDemoFile = join(deps.componentDir, 'demos', `${baseName}.tsx`);
                    const demoRef = relative(deps.docsRoot, absDemoFile);
                    const result = await extractPreview({
                        fileKey: deps.fileKey,
                        previewSlot: child.node,
                        componentDir: deps.componentDir,
                        baseName,
                        demoRef,
                        force: deps.force,
                        warnings: deps.warnings,
                    });
                    absDemoFiles.push(absDemoFile);
                    demoFiles.push(absDemoFile);
                    blocks.push({
                        kind: 'demo',
                        file: result.file,
                        placeholder: result.placeholder,
                        nodeId: result.nodeId,
                    });
                } else if (child.kind === 'table') {
                    const locator = `${section.title} / item ${idx + 1} / table`;
                    const md = renderTableForm(child.node, deps.warnings, locator);
                    if (md) blocks.push({ kind: 'table', markdown: md });
                } else if (child.kind === 'doCase' || child.kind === 'dontCase') {
                    const variant = child.kind === 'doCase' ? 'do' : 'dont';
                    const caseBaseName = `${baseName}-${variant}`;
                    const block = await buildCaseBlock({
                        client: deps.client,
                        fileKey: deps.fileKey,
                        caseFrame: child.node,
                        variant,
                        baseName: caseBaseName,
                        publicDir: deps.publicDir,
                        warnings: deps.warnings,
                        locator: `${section.title} / item ${idx + 1} / ${variant}`,
                    });
                    if (block) blocks.push(block);
                }
            }
            extractedItems.push({ blocks, absDemoFiles });
        }
        extractedSections.push({ title: section.title, slug: section.slug, items: extractedItems });
    }

    return {
        slug: doc.slug,
        docTitle: doc.docTitle,
        docDescription: doc.docDescription,
        sections: extractedSections,
        demoFiles,
        warnings: deps.warnings,
    };
}
