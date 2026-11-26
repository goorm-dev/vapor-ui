import { describe, expect, it } from 'vitest';

import type { ThemeOptions, ThemeResult } from '../src';
import {
    BASE_COLOR_HEX,
    HUE_ANCHORS,
    generatePrimitiveColorPalette,
    validatePalette,
} from '../src';
import { anchorHues } from '../src/application/engine/hue';
import { gamutChroma, hexToOklch, oklchToLinRgb, pyMod, toHex } from '../src/domain/color-math';
import { table } from './helpers';

const defaults = generatePrimitiveColorPalette();

const chip = (result: ThemeResult, mode: 'light' | 'dark', color: string, scale: string) =>
    (mode === 'light' ? result.lightModeTokens : result.darkModeTokens).palettes.find(
        (p) => p.name === color,
    )!.chips[scale];

const hueOf = (hex: string) => hexToOklch(hex.slice(1))[2];
const hueDiff = (a: number, b: number) => Math.abs(pyMod(a - b + 180, 360) - 180);

const failures = (result: ThemeResult) =>
    validatePalette(result).filter(
        (c) => ['target-contrast', 'chroma', 'a11y'].includes(c.id) && c.status === 'fail',
    );

describe('basicColors names', () => {
    it('adds a palette under a new name', () => {
        const result = generatePrimitiveColorPalette({
            basicColors: [{ name: 'mint', hexcode: '#3CC8B4' }],
        });
        const names = result.lightModeTokens.palettes.map((p) => p.name);
        expect(names).toHaveLength(defaults.lightModeTokens.palettes.length + 1);
        expect(names.filter((n) => n !== 'gray')).toHaveLength(12);
        expect(names).toContain('mint');
    });

    it('replaces a base color of the same name', () => {
        const result = generatePrimitiveColorPalette({
            basicColors: [{ name: 'blue', hexcode: '#3CC8B4' }],
        });
        expect(result.lightModeTokens.palettes).toHaveLength(
            defaults.lightModeTokens.palettes.length,
        );
        expect(table(result, 'light').blue).not.toEqual(table(defaults, 'light').blue);
    });
});

describe('hueOverrides', () => {
    const rotated = pyMod(hueOf(chip(defaults, 'light', 'blue', '500').hex) + 20, 360);
    const result = generatePrimitiveColorPalette({ hueOverrides: { blue: { '500': rotated } } });

    it('puts the light cell at the override hue and keeps its role', () => {
        expect(hueDiff(hueOf(chip(result, 'light', 'blue', '500').hex), rotated)).toBeLessThan(0.5);
        expect(failures(result)).toEqual([]);
    });

    it('leaves the other light cells and colors alone', () => {
        const before = table(defaults, 'light');
        const after = table(result, 'light');
        expect({ ...after.blue, '500': '' }).toEqual({ ...before.blue, '500': '' });
        expect({ ...after, blue: null }).toEqual({ ...before, blue: null });
    });

    it('derives dark from the overridden light curve', () => {
        expect(table(result, 'dark').blue).not.toEqual(table(defaults, 'dark').blue);
        expect({ ...table(result, 'dark'), blue: null }).toEqual({
            ...table(defaults, 'dark'),
            blue: null,
        });
    });

    it('overrides a basicColors palette by its lowercase name', () => {
        const options = { basicColors: [{ name: 'Mint', hexcode: '#3CC8B4' }] };
        const base = generatePrimitiveColorPalette(options);
        const hue = pyMod(hueOf(chip(base, 'light', 'mint', '700').hex) - 15, 360);
        const out = generatePrimitiveColorPalette({
            ...options,
            hueOverrides: { mint: { '700': hue } },
        });
        expect(hueDiff(hueOf(chip(out, 'light', 'mint', '700').hex), hue)).toBeLessThan(0.5);
        expect(failures(out)).toEqual([]);
    });

    it('never moves the pinned brand cell', () => {
        const brandColor = { name: 'acme', hexcode: '#FF6B00' };
        const base = generatePrimitiveColorPalette({ brandColor });
        const scale = base.brand!.scale;
        const out = generatePrimitiveColorPalette({
            brandColor,
            hueOverrides: { acme: { [scale]: 200 } },
        });
        expect(out.brand).toEqual(base.brand);
        expect(chip(out, 'light', 'acme', scale).hex).toBe('#ff6b00');
        expect(table(out, 'light')).toEqual(table(base, 'light'));
    });

    it('ignores the pinned brand cell override in the rest of the palette', () => {
        // pinned at 200, which also decides the yellow family and the 300 chroma
        const brandColor = { name: 'acme', hexcode: '#FFC96D' };
        const base = generatePrimitiveColorPalette({ brandColor });
        expect(base.brand!.scale).toBe('200');
        const out = generatePrimitiveColorPalette({
            brandColor,
            hueOverrides: { acme: { '200': 240 } },
        });
        expect(out).toEqual(base);
    });

    it('wraps hues into 0–360', () => {
        const wrapped = generatePrimitiveColorPalette({ hueOverrides: { yellow: { '200': 444 } } });
        const plain = generatePrimitiveColorPalette({ hueOverrides: { yellow: { '200': 84 } } });
        expect(wrapped).toEqual(plain);
        expect(failures(wrapped)).toEqual([]);
    });

    it.each([
        [{ nope: { '500': 120 } }, /Unknown palette/],
        [{ gray: { '500': 120 } }, /Unknown palette/],
        [{ toString: { '500': 120 } }, /Unknown palette/],
        [{ blue: { '000': 120 } }, /Invalid hue override step/],
        [{ blue: { '500': Number.NaN } }, /must be a finite number/],
        [{ blue: { '500': Infinity } }, /must be a finite number/],
        [{ blue: { '500': '120' } }, /must be a finite number/],
    ])('rejects %j', (hueOverrides, message) => {
        expect(() =>
            generatePrimitiveColorPalette({ hueOverrides } as unknown as ThemeOptions),
        ).toThrow(message);
    });

    it('matches the baseline with no or empty overrides', () => {
        expect(generatePrimitiveColorPalette({ hueOverrides: {} })).toEqual(defaults);
        expect(generatePrimitiveColorPalette({ hueOverrides: { blue: {} } })).toEqual(defaults);
        expect(generatePrimitiveColorPalette({ hueOverrides: undefined })).toEqual(defaults);
    });
});

describe('key HEX', () => {
    // A HEX with the 500 cell's lightness and chroma, its hue turned by `by` degrees.
    const turned = (name: string, by: number) => {
        const [L, C, H] = hexToOklch(chip(defaults, 'light', name, '500').hex.slice(1));
        return `#${toHex(oklchToLinRgb(L, gamutChroma(L, C, H + by), H + by))}`;
    };

    it.each(Object.entries(BASE_COLOR_HEX))(
        'rebuilds the default %s palette from its own BASE_COLOR_HEX',
        (name, hexcode) => {
            expect(chip(defaults, 'light', name, '500').hex.toUpperCase()).toBe(hexcode);
            expect(generatePrimitiveColorPalette({ basicColors: [{ name, hexcode }] })).toEqual(
                defaults,
            );
        },
    );

    it('rebuilds a base palette from its BASE_COLOR_HEX as a brand too', () => {
        const result = generatePrimitiveColorPalette({
            brandColor: { name: 'violet', hexcode: BASE_COLOR_HEX.violet },
        });
        expect(table(result, 'light').violet).toEqual(table(defaults, 'light').violet);
        expect(table(result, 'dark').violet).toEqual(table(defaults, 'dark').violet);
    });

    it('turns a base color along its own curve, even when another base 500 is nearer', () => {
        // red turned -12° sits nearer pink's 500, yet keeps red's corrected 900
        const hexcode = turned('red', -12);
        const result = generatePrimitiveColorPalette({ basicColors: [{ name: 'red', hexcode }] });
        const d = hueOf(chip(result, 'light', 'red', '600').hex) - HUE_ANCHORS.red['600'];
        expect(
            hueDiff(hueOf(chip(result, 'light', 'red', '900').hex), HUE_ANCHORS.red['900'] + d),
        ).toBeLessThan(0.5);

        const other = generatePrimitiveColorPalette({ basicColors: [{ name: 'ruby', hexcode }] });
        expect(table(other, 'light').ruby).not.toEqual(table(result, 'light').red);
    });

    it.each([
        ['basic', { basicColors: [{ name: 'ash', hexcode: '#808080' }] }],
        ['brand', { brandColor: { name: 'ash', hexcode: '#777' } }],
    ])('rejects a %s HEX too grey to carry a hue', (_, options) => {
        expect(() => generatePrimitiveColorPalette(options)).toThrow(/too grey/);
    });
});

describe('anchor curve', () => {
    it('turns each anchor gap the short way', () => {
        // 050→900 is 190° the long way; 600→900 is 20° the short way
        const hues = anchorHues({ '050': 0, '600': 170, '900': 190 });
        for (const s of ['600', '700', '800', '900'] as const) {
            expect(hues[s], s).toBeGreaterThan(169.5);
            expect(hues[s], s).toBeLessThan(190.5);
        }
    });
});
