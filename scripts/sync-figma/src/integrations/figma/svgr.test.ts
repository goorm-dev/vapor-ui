/**
 * The conversion contract: what our SVGR + svgo config must do to Figma's SVG output.
 *
 * This covers the axis that used to be checked by rasterizing Figma's SVG export and diffing it
 * against our render — a pixel comparison could only ever re-test svgo, and this does it offline.
 * Whether the components look like Figma's own raster is a separate question, answered by
 * parity/ against Figma PNGs.
 *
 * Run: pnpm --filter @repo/sync-figma test
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { svgToIconComponent } from './svgr';

/** Shaped like Figma's export: root fill="none", black children, document-global mask id. */
const MONO_SVG = `
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<mask id="mask0_1402_1014"><rect width="16" height="16" fill="white"/></mask>
<g mask="url(#mask0_1402_1014)">
<path d="M2 2H14V14H2V2Z" fill="black"/>
<path d="M4 4L12 12" stroke="#000000" stroke-width="2"/>
</g>
</svg>`;

const COLOR_SVG = `
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2 2H14V14H2V2Z" fill="#D22730"/>
<path d="M2 2H8V14H2V2Z" fill="black"/>
</svg>`;

const convert = (svg: string, iconName: string, isColorIcon = false) =>
    svgToIconComponent({ svg, iconName, isColorIcon });

test('mono icons follow the consumer colour', async () => {
    const out = await convert(MONO_SVG, 'SampleIcon');

    assert.match(out, /fill="currentColor"/, 'black fill must become currentColor');
    assert.match(out, /stroke="currentColor"/, 'black stroke must become currentColor');
    assert.doesNotMatch(out, /"(black|#000|#000000)"/i, 'no literal black may survive');
});

test('the root keeps fill="none" so stroked shapes stay hollow', async () => {
    const out = await convert(MONO_SVG, 'SampleIcon');

    // The attribute order is SVGR's, so match the root element rather than a fixed string.
    const root = /<IconBase([^>]*)>/.exec(out);
    assert.ok(root, 'output must wrap the SVG in IconBase');
    assert.match(root[1], /fill="none"/, 'dropping this fills every stroke-only icon solid');
});

test('colour icons keep the Figma palette', async () => {
    const out = await convert(COLOR_SVG, 'SampleColorIcon', true);

    assert.match(out, /fill="#D22730"/i);
    // `black` is a real palette value here, not a placeholder for currentColor.
    assert.doesNotMatch(out, /currentColor/);
});

test('ids are namespaced per icon so two icons on one page cannot collide', async () => {
    const first = await convert(MONO_SVG, 'FirstIcon');
    const second = await convert(MONO_SVG, 'SecondIcon');

    const idOf = (out: string) => /id="([^"]+)"/.exec(out)?.[1];
    assert.match(String(idOf(first)), /^vapor-icons-mono-FirstIcon/);
    assert.match(String(idOf(second)), /^vapor-icons-mono-SecondIcon/);
    assert.notEqual(idOf(first), idOf(second));
    // The reference has to move with the definition.
    assert.match(first, new RegExp(`url\\(#${idOf(first)}\\)`));

    const colour = await convert(COLOR_SVG, 'FirstIcon', true);
    assert.doesNotMatch(colour, /vapor-icons-mono-/);
});

test('IconBase owns the size: viewBox stays, width/height go', async () => {
    const out = await convert(MONO_SVG, 'SampleIcon');

    assert.match(out, /viewBox="0 0 16 16"/, 'without viewBox the icon cannot scale');
    assert.doesNotMatch(out, /width="16"/);
    assert.doesNotMatch(out, /height="16"/);
});

test('the component is an IconBase wrapper that forwards props', async () => {
    const out = await convert(MONO_SVG, 'SampleIcon');

    assert.match(out, /import IconBase from '~\/components\/icon-base';/);
    assert.match(out, /const SampleIcon = \(props: IconProps\)/);
    assert.match(out, /\{\.\.\.props\}/);
    assert.match(out, /export default SampleIcon;/);
    assert.doesNotMatch(out, /<svg/, 'the bare <svg> must be replaced, not nested');
});
