import type { ComponentType } from 'react';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import fs from 'node:fs/promises';
import path from 'node:path';
import pc from 'picocolors';
import type { Browser, Page } from 'playwright';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';

import { REPO_ROOT } from '~/utils/file-system';

import { CACHE_DIR, flags, onlyFilter } from './lib';

// The built bundle, not src: `pnpm --filter @vapor-ui/icons build` has to run first.
const ICON_BUNDLE = path.join(REPO_ROOT, 'packages/icons/dist/index.js');

// Mono icons follow `currentColor` (see transformer/svgr-config.ts) and Figma paints them black,
// so any other colour here fails all 594 of them at once.
const DEFAULT_COLOR = '#000';

type RenderProps = {
    width: number;
    height: number;
    style: { color: string; transform?: string };
};

async function rasterize(page: Page, svg: string, width: number, height: number): Promise<Buffer> {
    await page.setViewportSize({ width, height });
    // Transparent throughout: the Figma baseline has an alpha channel, and a white backdrop would
    // differ from it on every antialiased edge.
    await page.setContent(
        `<style>html,body{margin:0;padding:0;background:transparent}svg{display:block}</style>${svg}`,
    );
    return page.screenshot({ omitBackground: true });
}

async function main() {
    const args = flags();
    const color = args.color ?? DEFAULT_COLOR;
    const keep = onlyFilter(args.only);

    const baselineDir = path.join(CACHE_DIR, 'baseline');
    const codeDir = path.join(CACHE_DIR, 'render');
    await fs.mkdir(codeDir, { recursive: true });

    const icons = (await import(ICON_BUNDLE)) as Record<string, ComponentType<RenderProps>>;
    const names = (await fs.readdir(baselineDir))
        .filter((file) => file.endsWith('.png'))
        .map((file) => file.slice(0, -4))
        .filter(keep)
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
        // Sized from the baseline rather than a constant — compare.ts skips any icon whose two
        // PNGs differ in size, which would drop it out of the gate without failing.
        const markup = renderToStaticMarkup(
            createElement(Icon, {
                width: baseline.width,
                height: baseline.height,
                style: { color },
            }),
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

await main();
