import { kebabCase } from 'es-toolkit';

import { FigmaClient } from './figma.ts';
import { downloadWebpImages } from './images.ts';
import {
    readComponentMeta,
    readDoDontCaption,
    readItemMeta,
    readSectionTitle,
    readText,
} from './meta.ts';
import { renderMdx } from './renderer.ts';
import { discoverSections, findCoverFrame } from './sections.ts';
import { findDescendants, findItems, findSamples } from './traverse.ts';
import type { FigmaNode, Item, Section } from './types.ts';
import { prepareOutputs, writeComponentMdx } from './writer.ts';

export interface ExtractOptions {
    fileKey: string;
    nodeId: string;
    contentFile: (slug: string) => string;
    publicDir: (slug: string) => string;
    slugOverride?: string;
    skip?: string[];
    clean: boolean;
    token: string;
    liveExampleTicket: string;
}

export async function extract(opts: ExtractOptions): Promise<{
    slug: string;
    mdxPath: string;
    publicDir: string;
    warnings: string[];
}> {
    const warnings: string[] = [];
    const client = new FigmaClient(opts.token);

    const canvas = await client.getNode(opts.fileKey, opts.nodeId);
    const cover = findCoverFrame(canvas);
    const componentMeta = cover ? readComponentMeta(cover) : { name: canvas.name };
    const slug = opts.slugOverride ?? kebabCase(componentMeta.name);
    const mdxPath = opts.contentFile(slug);
    const publicDir = opts.publicDir(slug);

    await prepareOutputs(mdxPath, publicDir, opts.clean);

    const discovered = discoverSections(canvas, opts.skip ?? []);
    const sections: Record<string, Section> = {};

    for (const d of discovered) {
        const title = readSectionTitle(d.frame);
        const section = await buildSection({
            client,
            sectionKey: d.key,
            sectionFrame: d.frame,
            fileKey: opts.fileKey,
            publicDir,
            warnings,
            title,
        });
        sections[d.key] = section;
    }

    const mdx = renderMdx({
        slug,
        name: componentMeta.name,
        description: componentMeta.description,
        sections,
        liveExampleTicket: opts.liveExampleTicket,
    });

    await writeComponentMdx(mdxPath, mdx);
    return { slug, mdxPath, publicDir, warnings };
}

interface SectionBuildCtx {
    client: FigmaClient;
    sectionKey: string;
    sectionFrame: FigmaNode;
    fileKey: string;
    publicDir: string;
    warnings: string[];
    title: string;
}

async function buildSection(ctx: SectionBuildCtx): Promise<Section> {
    const items = await buildSectionItems(ctx);
    const section: Section = { title: ctx.title, items };
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

async function buildGenericSampleItems(ctx: SectionBuildCtx): Promise<Item[]> {
    const itemNodes = findItems(ctx.sectionFrame);
    if (itemNodes.length === 0) return buildLegacyGenericItems(ctx);
    const samplesByItem = itemNodes.map((n) => findSamples(n)[0]);
    const jobs: Array<{ nodeId: string; baseName: string; itemIdx: number }> = [];
    itemNodes.forEach((_, idx) => {
        const sample = samplesByItem[idx];
        if (!sample) return;
        jobs.push({
            nodeId: sample.id,
            baseName: `${ctx.sectionKey.toLowerCase()}-${pad(idx + 1)}`,
            itemIdx: idx,
        });
    });
    const paths = await downloadWebpImages(
        ctx.client,
        ctx.fileKey,
        jobs.map((j) => ({ nodeId: j.nodeId, baseName: j.baseName })),
        ctx.publicDir,
    );
    return itemNodes.map((node, idx) => {
        const meta = readItemMeta(node);
        const sample = samplesByItem[idx];
        const path = sample ? paths[sample.id] : undefined;
        const item: Item = { ...meta };
        if (path) item.image = path;
        return item;
    });
}

/** Fallback for sections that still use the legacy sample-only layout (no Item wrapper). */
async function buildLegacyGenericItems(ctx: SectionBuildCtx): Promise<Item[]> {
    const samples = findSamples(ctx.sectionFrame);
    if (samples.length === 0) return [];
    const jobs = samples.map((s, idx) => ({
        nodeId: s.id,
        baseName: `${ctx.sectionKey.toLowerCase()}-${pad(idx + 1)}`,
    }));
    const paths = await downloadWebpImages(ctx.client, ctx.fileKey, jobs, ctx.publicDir);
    return samples.map((s) => {
        const path = paths[s.id];
        const item: Item = {};
        if (path) item.image = path;
        return item;
    });
}

async function buildAnatomyImage(ctx: SectionBuildCtx): Promise<string | undefined> {
    const samples = findSamples(ctx.sectionFrame);
    if (samples.length === 0) return undefined;
    const sample = samples[0]!;
    const paths = await downloadWebpImages(
        ctx.client,
        ctx.fileKey,
        [{ nodeId: sample.id, baseName: 'anatomy' }],
        ctx.publicDir,
    );
    return paths[sample.id];
}

async function buildAnatomyItems(ctx: SectionBuildCtx): Promise<Item[]> {
    const tableFrame = findDescendants(
        ctx.sectionFrame,
        (n) => n.type === 'FRAME' && n.name === 'Anatomy name',
    )[0];
    if (!tableFrame) return [];
    const rows = (tableFrame.children ?? []).filter(
        (c) => c.type === 'FRAME' && c.name === 'description',
    );
    const sortedRows = [...rows].sort((a, b) => {
        const ay = a.absoluteBoundingBox?.y ?? 0;
        const by = b.absoluteBoundingBox?.y ?? 0;
        if (ay !== by) return ay - by;
        return (a.absoluteBoundingBox?.x ?? 0) - (b.absoluteBoundingBox?.x ?? 0);
    });
    const items: Item[] = [];
    for (const row of sortedRows) {
        // Pick the top-level guide text instance for this row (variant other than `body`,
        // which is the placeholder slot). Depth-first search returns the body child first,
        // so filter by variant to land on the row-name text.
        const textInstances = findDescendants(
            row,
            (n) =>
                n.type === 'INSTANCE' && (n.name === 'Component guide/Text' || n.name === 'Text'),
        );
        const nameInstance = textInstances.find((n) => {
            const variant = n.componentProperties?.type?.value;
            return typeof variant === 'string' && !variant.toLowerCase().includes('body');
        });
        const name = nameInstance ? readText(nameInstance) : undefined;
        if (!name) continue;
        const optional =
            findDescendants(row, (n) => n.type === 'TEXT' && n.name === '(Optional)').length > 0;
        items.push({ name, optional });
    }
    return items;
}

async function buildDoDontItems(ctx: SectionBuildCtx): Promise<Item[]> {
    const itemNodes = findItems(ctx.sectionFrame);
    if (itemNodes.length === 0) return [];
    const doFrames = itemNodes.map(
        (n) => findDescendants(n, (c) => c.name === 'Do' && c.type === 'FRAME')[0],
    );
    const dontFrames = itemNodes.map(
        (n) => findDescendants(n, (c) => c.name === "Don't" && c.type === 'FRAME')[0],
    );
    const jobs: Array<{ nodeId: string; baseName: string; slot: 'do' | 'dont'; itemIdx: number }> =
        [];
    itemNodes.forEach((_, idx) => {
        const doFrame = doFrames[idx];
        const dontFrame = dontFrames[idx];
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
        ctx.publicDir,
    );
    return itemNodes.map((node, idx) => {
        const meta = readItemMeta(node);
        const doFrame = doFrames[idx];
        const dontFrame = dontFrames[idx];
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
        return item;
    });
}

async function buildExamplesItems(ctx: SectionBuildCtx): Promise<Item[]> {
    const itemNodes = findItems(ctx.sectionFrame);
    if (itemNodes.length === 0) return [];
    return itemNodes.map((node) => readItemMeta(node));
}

function pad(n: number): string {
    return n.toString().padStart(2, '0');
}
