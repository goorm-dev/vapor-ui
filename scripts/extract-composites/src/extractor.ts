import { kebabCase } from 'es-toolkit';

import { fetchAndSaveCodeConnect } from './codeConnect.ts';
import { FigmaClient } from './figma.ts';
import { downloadWebpImages } from './images.ts';
import {
    CONTENT_BLOCK_NAME,
    mapMetaFromAncestry,
    readComponentMeta,
    readDoDontCaption,
    readSectionTitle,
    readText,
} from './meta.ts';
import { discoverSections, findCoverFrame } from './sections.ts';
import { collectAncestorsMap, findDescendants, findSamples } from './traverse.ts';
import type { FigmaNode, IndexJson, Item, Section } from './types.ts';
import { prepareOutputDir, writeIndexJson } from './writer.ts';

export interface ExtractOptions {
    fileKey: string;
    nodeId: string;
    outputRoot: string;
    slugOverride?: string;
    skip?: string[];
    label: string;
    clean: boolean;
    token: string;
}

export async function extract(opts: ExtractOptions): Promise<{
    slug: string;
    outputDir: string;
    warnings: string[];
}> {
    const warnings: string[] = [];
    const client = new FigmaClient(opts.token);

    const canvas = await client.getNode(opts.fileKey, opts.nodeId);
    const cover = findCoverFrame(canvas);
    const componentMeta = cover
        ? readComponentMeta(cover)
        : { name: canvas.name };
    const slug = opts.slugOverride ?? kebabCase(componentMeta.name);
    const outputDir = `${opts.outputRoot}/${slug}`;

    await prepareOutputDir(outputDir, opts.clean);

    const discovered = discoverSections(canvas, opts.skip ?? []);
    const sections: Record<string, Section> = {};

    for (const d of discovered) {
        const title = readSectionTitle(d.frame);
        const section = await buildSection({
            client,
            sectionKey: d.key,
            sectionFrame: d.frame,
            fileKey: opts.fileKey,
            outputDir,
            label: opts.label,
            warnings,
            title,
        });
        sections[d.key] = section;
    }

    const index: IndexJson = {
        slug,
        name: componentMeta.name,
        ...(componentMeta.description ? { description: componentMeta.description } : {}),
        source: {
            fileKey: opts.fileKey,
            nodeId: opts.nodeId,
            extractedAt: new Date().toISOString(),
        },
        sections,
    };

    await writeIndexJson(outputDir, index);
    return { slug, outputDir, warnings };
}

interface SectionBuildCtx {
    client: FigmaClient;
    sectionKey: string;
    sectionFrame: FigmaNode;
    fileKey: string;
    outputDir: string;
    label: string;
    warnings: string[];
    title: string;
}

async function buildSection(ctx: SectionBuildCtx): Promise<Section> {
    const items = await buildSectionItems(ctx);
    const section: Section = { title: ctx.title, items };
    // Anatomy carries a section-level diagram image
    if (ctx.sectionKey === 'anatomy') {
        const anatomyImage = await buildAnatomyImage(ctx);
        if (anatomyImage) section.image = anatomyImage;
    }
    return section;
}

async function buildSectionItems(ctx: SectionBuildCtx): Promise<Item[]> {
    const key = ctx.sectionKey;
    if (key === 'examples') return buildExamplesItems(ctx);
    if (key === 'doDont') return buildDoDontItems(ctx);
    if (key === 'anatomy') return buildAnatomyItems(ctx);
    return buildGenericSampleItems(ctx);
}

/** Pattern / unknown: each Sample becomes one item with image + subtitle/description meta. */
async function buildGenericSampleItems(ctx: SectionBuildCtx): Promise<Item[]> {
    const samples = findSamples(ctx.sectionFrame);
    if (samples.length === 0) return [];
    const ancestors = collectAncestorsMap(ctx.sectionFrame);
    const jobs = samples.map((s, idx) => ({
        nodeId: s.id,
        baseName: `${ctx.sectionKey.toLowerCase()}-${pad(idx + 1)}`,
    }));
    const paths = await downloadWebpImages(ctx.client, ctx.fileKey, jobs, ctx.outputDir);
    return samples.map((s) => {
        const meta = mapMetaFromAncestry(s, [...(ancestors.get(s.id) ?? []), s]);
        const path = paths[s.id];
        const item: Item = { ...meta };
        if (path) item.image = path;
        return item;
    });
}

/** Anatomy section-level diagram image: export the Sample frame. */
async function buildAnatomyImage(ctx: SectionBuildCtx): Promise<string | undefined> {
    const samples = findSamples(ctx.sectionFrame);
    if (samples.length === 0) return undefined;
    const sample = samples[0]!;
    const paths = await downloadWebpImages(
        ctx.client,
        ctx.fileKey,
        [{ nodeId: sample.id, baseName: 'anatomy' }],
        ctx.outputDir,
    );
    return paths[sample.id];
}

/** Anatomy items: measurement table rows {name, optional} from "Anatomy name" frame. */
async function buildAnatomyItems(ctx: SectionBuildCtx): Promise<Item[]> {
    // The table lives in a sibling frame named "Anatomy name"; each row is a frame
    // named "description" containing a Component guide/Text (the name) and optionally
    // an "(Optional)" TEXT marker.
    const tableFrame = findDescendants(
        ctx.sectionFrame,
        (n) => n.type === 'FRAME' && n.name === 'Anatomy name',
    )[0];
    if (!tableFrame) return [];
    const rows = (tableFrame.children ?? []).filter(
        (c) => c.type === 'FRAME' && c.name === 'description',
    );
    // Sort by y, then x so numbered rows land in display order
    const sortedRows = [...rows].sort((a, b) => {
        const ay = a.absoluteBoundingBox?.y ?? 0;
        const by = b.absoluteBoundingBox?.y ?? 0;
        if (ay !== by) return ay - by;
        return (a.absoluteBoundingBox?.x ?? 0) - (b.absoluteBoundingBox?.x ?? 0);
    });
    const items: Item[] = [];
    for (const row of sortedRows) {
        const textInstance = findDescendants(
            row,
            (n) => n.type === 'INSTANCE' && n.name === 'Component guide/Text',
        )[0];
        const name = textInstance ? readText(textInstance) : undefined;
        if (!name) continue;
        const optional =
            findDescendants(row, (n) => n.type === 'TEXT' && n.name === '(Optional)').length > 0;
        items.push({ name, optional });
    }
    return items;
}

/** Do+Don't: each Content block = 1 item with do + dont pair. */
async function buildDoDontItems(ctx: SectionBuildCtx): Promise<Item[]> {
    const contentBlocks = findDescendants(
        ctx.sectionFrame,
        (n) => n.type === 'INSTANCE' && n.name === CONTENT_BLOCK_NAME,
    );
    const jobs: Array<{ nodeId: string; baseName: string; slot: 'do' | 'dont'; itemIdx: number }> =
        [];
    contentBlocks.forEach((block, idx) => {
        const doFrame = findDescendants(block, (n) => n.name === 'Do' && n.type === 'FRAME')[0];
        const dontFrame = findDescendants(
            block,
            (n) => n.name === "Don't" && n.type === 'FRAME',
        )[0];
        const doSample = doFrame ? (findSamples(doFrame)[0] ?? doFrame) : undefined;
        const dontSample = dontFrame ? (findSamples(dontFrame)[0] ?? dontFrame) : undefined;
        if (doSample) {
            jobs.push({
                nodeId: doSample.id,
                baseName: `do-dont-${pad(idx + 1)}-do`,
                slot: 'do',
                itemIdx: idx,
            });
        }
        if (dontSample) {
            jobs.push({
                nodeId: dontSample.id,
                baseName: `do-dont-${pad(idx + 1)}-dont`,
                slot: 'dont',
                itemIdx: idx,
            });
        }
    });
    const paths = await downloadWebpImages(
        ctx.client,
        ctx.fileKey,
        jobs.map((j) => ({ nodeId: j.nodeId, baseName: j.baseName })),
        ctx.outputDir,
    );
    const ancestors = collectAncestorsMap(ctx.sectionFrame);
    const items: Item[] = [];
    contentBlocks.forEach((block, idx) => {
        const meta = mapMetaFromAncestry(block, [...(ancestors.get(block.id) ?? []), block]);
        const doFrame = findDescendants(block, (n) => n.name === 'Do' && n.type === 'FRAME')[0];
        const dontFrame = findDescendants(
            block,
            (n) => n.name === "Don't" && n.type === 'FRAME',
        )[0];
        const doJob = jobs.find((j) => j.itemIdx === idx && j.slot === 'do');
        const dontJob = jobs.find((j) => j.itemIdx === idx && j.slot === 'dont');
        const item: Item = { ...meta };
        if (doJob && paths[doJob.nodeId]) {
            item.do = { image: paths[doJob.nodeId]! };
            const caption = doFrame ? readDoDontCaption(doFrame) : undefined;
            if (caption) item.do.caption = caption;
        }
        if (dontJob && paths[dontJob.nodeId]) {
            item.dont = { image: paths[dontJob.nodeId]! };
            const caption = dontFrame ? readDoDontCaption(dontFrame) : undefined;
            if (caption) item.dont.caption = caption;
        }
        items.push(item);
    });
    return items;
}

/** Examples: Content block > Sample slot/frame contains the sample instance. Code Connect. */
async function buildExamplesItems(ctx: SectionBuildCtx): Promise<Item[]> {
    const contentBlocks = findDescendants(
        ctx.sectionFrame,
        (n) => n.type === 'INSTANCE' && n.name === CONTENT_BLOCK_NAME,
    );
    const items: Item[] = [];
    const ancestors = collectAncestorsMap(ctx.sectionFrame);
    for (let idx = 0; idx < contentBlocks.length; idx++) {
        const block = contentBlocks[idx]!;
        const meta = mapMetaFromAncestry(block, [...(ancestors.get(block.id) ?? []), block]);
        // Prefer a direct Sample child; otherwise take the first non-Component-guide instance
        const sampleContainer = findSamples(block)[0];
        const sampleInstance = sampleContainer
            ? findDescendants(
                  sampleContainer,
                  (n) => n.type === 'INSTANCE' && !n.name.startsWith('Component guide/'),
              )[0]
            : findDescendants(
                  block,
                  (n) => n.type === 'INSTANCE' && !n.name.startsWith('Component guide/'),
              )[0];
        if (!sampleInstance) {
            items.push(meta);
            continue;
        }
        const result = await fetchAndSaveCodeConnect(
            ctx.client,
            sampleInstance.id,
            ctx.outputDir,
            `examples-${pad(idx + 1)}`,
            ctx.label,
            ctx.warnings,
        );
        items.push({
            ...meta,
            code: result.code,
            codeLabel: result.codeLabel,
        });
    }
    return items;
}

function pad(n: number): string {
    return n.toString().padStart(2, '0');
}
