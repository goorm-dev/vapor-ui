/**
 * Step 1 — download Figma's own raster for every icon.
 *
 * Usage:
 *   tsx parity/fetch-baseline.ts [--type=basic|symbol] [--limit=N] [--scale=N]
 *
 * The baseline is a PNG on purpose: this check asks whether our components render the way FIGMA
 * renders them, so the reference has to come out of Figma's rasterizer. Comparing against Figma's
 * SVG export instead would only re-test svgo, which src/integrations/figma/svgr.test.ts covers
 * offline and for free.
 *
 * Already-downloaded icons are skipped, so changing `--scale` means clearing `.cache/baseline`
 * first — otherwise the previous scale's files are reused and the run silently mixes sizes.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import pLimit from 'p-limit';
import pc from 'picocolors';

import {
    FIGMA_ICONS_FILE_KEY,
    FIGMA_ICONS_SYMBOL_COLOR_COUNTRY_NODE_ID,
    FIGMA_ICONS_SYMBOL_COLOR_NODE_ID,
    FIGMA_NODE_TYPES,
} from '~/icons/constants';
import { ICON_TYPES } from '~/icons/icon-types';
import { getImage } from '~/integrations/figma/api';
import type { IconNode } from '~/integrations/figma/lib';
import { filterDocumentByNodeType } from '~/integrations/figma/lib';

import type { Manifest } from './lib';
import { CACHE_DIR, MANIFEST, flags, normalizeIconName } from './lib';

// Figma's images endpoint has no documented node-count cap, but percent-encoding the `:` in node
// ids pushed a 814-node query past 8KB and returned HTTP 414 (measured). Batch to stay under it.
const BATCH_SIZE = 200;

/** Same rule as commands/sync-icons.ts: colour-ness is the parent canvas, not the icon name. */
const COLOR_NODE_IDS = [
    FIGMA_ICONS_SYMBOL_COLOR_NODE_ID,
    FIGMA_ICONS_SYMBOL_COLOR_COUNTRY_NODE_ID,
].map(decodeURIComponent);

const args = flags();
const type = args.type ?? 'basic';
const limit = args.limit ? Number(args.limit) : Infinity;
// 4 is Figma's documented maximum, so 64px is all the resolution this check can get.
const scale = args.scale ? Number(args.scale) : 4;

if (!process.env.FIGMA_TOKEN) {
    console.error(pc.red('FIGMA_TOKEN is not set.'));
    process.exit(1);
}
if (!(type in ICON_TYPES)) {
    console.error(pc.red(`--type must be one of ${Object.keys(ICON_TYPES).join(', ')}`));
    process.exit(1);
}
// Figma's documented range. Out of range comes back as HTTP 400 with no per-node detail.
if (!Number.isFinite(scale) || scale < 0.01 || scale > 4) {
    console.error(pc.red(`--scale must be between 0.01 and 4 (got ${args.scale})`));
    process.exit(1);
}

const outDir = path.join(CACHE_DIR, 'baseline');
await fs.mkdir(outDir, { recursive: true });

let components: IconNode[] = [];
for (const nodeId of ICON_TYPES[type].nodeIds) {
    components = components.concat(
        await filterDocumentByNodeType({
            nodeType: FIGMA_NODE_TYPES.Component,
            fileKey: FIGMA_ICONS_FILE_KEY,
            nodeIds: nodeId,
            depth: 1,
        }),
    );
}
components.sort((a, b) => normalizeIconName(a.name).localeCompare(normalizeIconName(b.name)));

const wanted = components.slice(0, limit).map((node) => ({
    id: node.id,
    name: normalizeIconName(node.name),
    isColorIcon: COLOR_NODE_IDS.includes(node.parentId),
}));

// compare.ts only gates mono icons, so it needs Figma's own answer to "is this a colour icon".
// Rewritten every run, merged across --type runs so a basic run does not drop the symbol flags.
const manifest: Manifest = JSON.parse(await fs.readFile(MANIFEST, 'utf8').catch(() => '{}'));
for (const icon of wanted) manifest[icon.name] = { id: icon.id, isColorIcon: icon.isColorIcon };
await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2));

// Already-downloaded icons are skipped so re-runs are cheap.
const missing: typeof wanted = [];
for (const icon of wanted) {
    const file = path.join(outDir, `${icon.name}.png`);
    if (!(await fs.stat(file).catch(() => null))) missing.push(icon);
}
console.log(`${wanted.length} icons, ${missing.length} to download (scale ${scale})`);

const urls = new Map<string, string>();
for (let i = 0; i < missing.length; i += BATCH_SIZE) {
    const batch = missing.slice(i, i + BATCH_SIZE);
    const { images } = await getImage({
        fileKey: FIGMA_ICONS_FILE_KEY,
        nodeIds: batch.map((icon) => icon.id).join(','),
        format: 'png',
        // Figma renders PNGs at the node bbox; scale=4 on a 16px icon gives 64px.
        scale,
    });
    for (const icon of batch) {
        // HTTP 200 does not mean every node rendered — nulls are per-node failures.
        const url = images[icon.id];
        if (!url) console.warn(pc.yellow(`render failed: ${icon.name}`));
        else urls.set(icon.name, url);
    }
}

const concurrency = pLimit(10);
await Promise.all(
    [...urls].map(([name, url]) =>
        concurrency(async () => {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`${name}: ${response.status} ${response.statusText}`);
            await fs.writeFile(
                path.join(outDir, `${name}.png`),
                Buffer.from(await response.arrayBuffer()),
            );
        }),
    ),
);

console.log(pc.green(`baseline ready: ${outDir}`));
