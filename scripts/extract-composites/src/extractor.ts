import { kebabCase } from 'es-toolkit';
import { join, relative } from 'node:path';

import { FigmaClient } from './clients/figma.ts';
import { HEADER_INSTANCE_NAME, TEXT_NAMES } from './shared/constants.ts';
import { findExportFrame, findTextByName } from './shared/traverse.ts';
import type { FigmaNode, Item, ItemBlock, Section, SectionTitle } from './shared/types.ts';
import { SECTION_SLUG } from './shared/types.ts';
import { discoverSections } from './tools/analyzer/discover-sections.ts';
import { findComponentHeader } from './tools/analyzer/find-component-header.ts';
import { extractPreview } from './tools/extractor/code-connect.ts';
import { downloadWebpImages } from './tools/extractor/images.ts';
import { buildCaseBlock, sortByPolicy } from './tools/normalizer/build-blocks.ts';
import { parseItemChildren } from './tools/normalizer/parse-item-children.ts';
import { renderTableForm } from './tools/normalizer/parse-table.ts';
import { prepareOutputs, writeComponentMdx } from './tools/renderer/io.ts';
import { renderMdx } from './tools/renderer/mdx.ts';
import { findItems } from './tools/selector/find-items.ts';

export interface ExtractOptions {
    fileKey: string;
    nodeId: string;
    contentFile: (slug: string) => string;
    publicDir: (slug: string) => string;
    componentDir: (slug: string) => string;
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

    const contentFile = opts.contentFile(slug);
    const publicDir = opts.publicDir(slug);
    const componentDir = opts.componentDir(slug);
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
        const slugForSection = SECTION_SLUG[title];
        const itemNodes = findItems(frame);
        const items: Item[] = [];
        for (let idx = 0; idx < itemNodes.length; idx++) {
            const itemNode = itemNodes[idx]!;
            const baseName = `${slugForSection}-${pad(idx + 1)}`;
            const blocks: ItemBlock[] = [];
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
                            ? `${title} / item ${idx + 1} / sample ${sampleIdx}`
                            : `${title} / item ${idx + 1} / sample`;
                    const exportFrame = findExportFrame(child.node);
                    const targetNode = exportFrame ?? child.node;
                    if (!exportFrame) {
                        warnings.push(
                            `${locator}: Export frame missing, used Sample fallback (${child.node.id})`,
                        );
                    }
                    const webpRel = await downloadWebpImages(
                        client,
                        opts.fileKey,
                        [{ nodeId: targetNode.id, baseName: sampleBaseName }],
                        publicDir,
                    );
                    const rel = webpRel[targetNode.id];
                    if (rel) {
                        const alt =
                            title === 'Anatomy'
                                ? sampleCount > 1
                                    ? `${docTitle} 아나토미 구조 ${sampleIdx}`
                                    : `${docTitle} 아나토미 구조`
                                : currentSubtitle;
                        blocks.push({ kind: 'docsImage', webpRel: rel, alt });
                    } else warnings.push(`${locator}: export failed (${targetNode.id})`);
                } else if (child.kind === 'preview') {
                    const absDemoFile = join(componentDir, 'demos', `${baseName}.tsx`);
                    const demoRef = relative(opts.docsRoot, absDemoFile);
                    const result = await extractPreview({
                        fileKey: opts.fileKey,
                        previewSlot: child.node,
                        componentDir,
                        baseName,
                        demoRef,
                        force: opts.force,
                        warnings,
                    });
                    demoFiles.push(absDemoFile);
                    blocks.push({
                        kind: 'demo',
                        file: result.file,
                        placeholder: result.placeholder,
                        nodeId: result.nodeId,
                    });
                } else if (child.kind === 'table') {
                    const locator = `${title} / item ${idx + 1} / table`;
                    const md = renderTableForm(child.node, warnings, locator);
                    if (md) blocks.push({ kind: 'table', markdown: md });
                } else if (child.kind === 'doCase' || child.kind === 'dontCase') {
                    const variant = child.kind === 'doCase' ? 'do' : 'dont';
                    const caseBaseName = `${baseName}-${variant}`;
                    const block = await buildCaseBlock({
                        client,
                        fileKey: opts.fileKey,
                        caseFrame: child.node,
                        variant,
                        baseName: caseBaseName,
                        publicDir,
                        warnings,
                        locator: `${title} / item ${idx + 1} / ${variant}`,
                    });
                    if (block) blocks.push(block);
                }
            }
            items.push({ blocks });
        }
        sections.push({ title, slug: slugForSection, items });
    }

    const sortedSections = sortByPolicy(sections);

    console.log(`총 ${sortedSections.length}개의 프레임을 마크다운으로 변환합니다...\n`);

    const mdx = renderMdx({
        slug,
        title: docTitle,
        description: docDescription,
        sections: sortedSections,
    });
    await writeComponentMdx(contentFile, mdx);

    console.log(`컴포넌트 문서가 작성되었습니다!`);
    console.log(contentFile + '\n');

    return {
        slug,
        mdxPath: contentFile,
        publicDir,
        componentDir,
        demoFiles,
        warnings,
    };
}

function resolveComponentMeta(
    canvas: FigmaNode,
    canvasName: string,
    warnings: string[],
): { title: string; description: string } {
    const header = findComponentHeader(canvas);
    if (!header) {
        warnings.push(
            `${HEADER_INSTANCE_NAME} INSTANCE (type=component) missing — frontmatter falls back to canvas name`,
        );
        return { title: canvasName, description: '' };
    }
    const title = findTextByName(header, TEXT_NAMES.componentName) ?? canvasName;
    const description = findTextByName(header, TEXT_NAMES.componentDescription) ?? '';
    if (!description) {
        warnings.push(`${HEADER_INSTANCE_NAME}: "${TEXT_NAMES.componentDescription}" TEXT missing`);
    }
    return { title, description };
}
