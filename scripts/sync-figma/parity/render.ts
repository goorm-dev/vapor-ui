/**
 * Step 2 — raster each icon component with headless Chromium.
 *
 * Usage:
 *   tsx parity/render.ts [--color=#000]
 *
 * Only our side is rendered — the Figma side is already a PNG from step 1. Each render matches the
 * exact pixel size of its baseline, because Figma rasters at the node bbox and that is not square
 * for every icon (InstagramIcon comes back 65x64), and pixelmatch throws on a size mismatch.
 *
 * The component is never regex-converted back to SVG — `renderToStaticMarkup` on the built bundle
 * is the only correct source (past regex round-trips mangled `stopColor`/`maskUnits`).
 */
import type { ComponentType } from 'react';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import fs from 'node:fs/promises';
import path from 'node:path';
import pc from 'picocolors';
import type { Browser, Page } from 'playwright';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';

import { CACHE_DIR, REPO_ROOT, flags } from './lib';

const ICON_BUNDLE = path.join(REPO_ROOT, 'packages/icons/dist/index.js');

/**
 * Figma exports monochrome icons with the children hard-coded to black
 * (`fill="black"` / `stroke="black"`; verified on the downloaded baselines), while the code side
 * paints with `currentColor`. Rendering at #000 pins both to the same value so only geometry
 * differences land in the diff.
 */
const DEFAULT_COLOR = '#000';

/** Replace the root <svg> width/height (and force a color) without touching the geometry. */
function normalizeSvgRoot(svg: string, width: number, height: number, color?: string): string {
    return svg.replace(/<svg\b[^>]*>/, (tag) => {
        const stripped = tag.replace(/\s+(width|height|style)="[^"]*"/g, '');
        const style = color ? ` style="color:${color}"` : '';
        return `${stripped.slice(0, -1)} width="${width}" height="${height}"${style}>`;
    });
}

/**
 * Raster one SVG string to a transparent PNG.
 *
 * One document per icon, via a `data:` URI <img>: SVGs can carry document-global ids, so putting
 * several in one document makes `url(#...)` resolve to the first definition — measured as 213
 * false mismatches back when the Figma SVGs were rendered here too.
 */
async function rasterize(page: Page, svg: string, width: number, height: number): Promise<Buffer> {
    const src = `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;
    await page.setViewportSize({ width, height });
    await page.setContent(
        `<style>html,body{margin:0;padding:0;background:transparent}img{display:block}</style>` +
            `<img width="${width}" height="${height}" src="${src}">`,
    );
    // String form on purpose: this package's tsconfig has no DOM lib.
    await page.waitForFunction(
        'document.images[0]?.complete && document.images[0].naturalWidth > 0',
    );
    // omitBackground only clears the browser's default base color — the CSS above must stay
    // transparent too, or the background would still be painted.
    return page.screenshot({ omitBackground: true });
}

async function main() {
    const args = flags();
    const color = args.color ?? DEFAULT_COLOR;

    const baselineDir = path.join(CACHE_DIR, 'baseline');
    const codeDir = path.join(CACHE_DIR, 'render');
    await fs.mkdir(codeDir, { recursive: true });

    const icons = (await import(ICON_BUNDLE)) as Record<string, ComponentType<object>>;
    const names = (await fs.readdir(baselineDir))
        .filter((file) => file.endsWith('.png'))
        .map((file) => file.slice(0, -4))
        .sort();

    const browser: Browser = await chromium.launch();
    const page = await browser.newPage();
    let rendered = 0;
    const missing: string[] = [];

    for (const name of names) {
        const Icon = icons[name];
        if (typeof Icon !== 'function') {
            missing.push(name);
            continue;
        }

        const baseline = PNG.sync.read(await fs.readFile(path.join(baselineDir, `${name}.png`)));
        const markup = normalizeSvgRoot(
            renderToStaticMarkup(createElement(Icon)),
            baseline.width,
            baseline.height,
            color,
        );
        await fs.writeFile(
            path.join(codeDir, `${name}.png`),
            await rasterize(page, markup, baseline.width, baseline.height),
        );
        rendered++;
    }

    await browser.close();
    if (missing.length) {
        console.warn(
            pc.yellow(`no component exported for ${missing.length}: ${missing.join(', ')}`),
        );
    }
    console.log(pc.green(`rendered ${rendered} icons -> ${codeDir}`));
}

export { DEFAULT_COLOR, normalizeSvgRoot, rasterize };

if (import.meta.url === `file://${process.argv[1]}`) await main();
