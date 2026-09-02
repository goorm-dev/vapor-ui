/**
 * Proof that the harness can tell same from different.
 *
 * Usage: tsx parity/selfcheck.ts
 *
 * Needs no Figma token — it renders components from the built bundle against each other.
 */
import type { ComponentType } from 'react';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import assert from 'node:assert/strict';
import path from 'node:path';
import pixelmatch from 'pixelmatch';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';

import { REPO_ROOT } from './lib';
import { DEFAULT_COLOR, normalizeSvgRoot, rasterize } from './render';

const SIZE = 64; // same as a scale=4 baseline
const THRESHOLD = 1; // same default as compare.ts

const icons = (await import(path.join(REPO_ROOT, 'packages/icons/dist/index.js'))) as Record<
    string,
    ComponentType<object>
>;

const browser = await chromium.launch();
const page = await browser.newPage();

const shoot = async (name: string, color = DEFAULT_COLOR) => {
    const Icon = icons[name];
    assert.equal(typeof Icon, 'function', `${name} is not exported from the icons bundle`);
    const markup = normalizeSvgRoot(renderToStaticMarkup(createElement(Icon)), SIZE, SIZE, color);
    return new Uint8Array(PNG.sync.read(await rasterize(page, markup, SIZE, SIZE)).data);
};

const diff = (a: Uint8Array, b: Uint8Array) =>
    pixelmatch(a, b, undefined, SIZE, SIZE, { threshold: 0.1 });

const fill = await shoot('AchievementIcon');
const fillAgain = await shoot('AchievementIcon');
const outline = await shoot('AchievementOutlineIcon');
// A sparse glyph (~2% canvas coverage) recolored end to end: the count is not normalized by ink,
// so this pins that even a thin icon's recolor clears the line.
const sparseBlack = await shoot('IntelliSenseNullIcon');
const sparseRed = await shoot('IntelliSenseNullIcon', '#f00');
await browser.close();

// 1. Same icon rendered twice must be indistinguishable.
const same = diff(fill, fillAgain);
assert.equal(same, 0, `identical render should be 0 diff pixels, got ${same}`);

// 2. Fill vs Outline is a genuinely different shape and must clear the failure threshold.
const different = diff(fill, outline);
assert.ok(different > THRESHOLD, `Fill vs Outline should exceed ${THRESHOLD}, got ${different}`);

// 3. A recolor must fail regardless of how little canvas the glyph covers.
const recolored = diff(sparseBlack, sparseRed);
assert.ok(recolored > THRESHOLD, `sparse recolor should exceed ${THRESHOLD}, got ${recolored}`);

console.log(
    `selfcheck ok — same: ${same}, fill vs outline: ${different}, sparse recolor: ${recolored}`,
);
