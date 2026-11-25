import { describe, expect, it } from 'vitest';

import type { ThemeOptions, ThemeResult } from '../src';
import { HUE_ANCHORS, generatePrimitiveColorPalette, validatePalette } from '../src';
import { hexToOklch, pyMod } from '../src/domain/color-math';
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

describe('hueAnchors', () => {
    it('puts each given anchor step at its hue', () => {
        const result = generatePrimitiveColorPalette({
            hueAnchors: { red: { '900': 30 }, violet: { '050': 300, '600': 285 } },
        });
        expect(hueDiff(hueOf(chip(result, 'light', 'red', '900').hex), 30)).toBeLessThan(0.5);
        // 050 chroma is low enough that 8-bit HEX moves its hue by up to ~2°
        expect(hueDiff(hueOf(chip(result, 'light', 'violet', '050').hex), 300)).toBeLessThan(2);
        expect(hueDiff(hueOf(chip(result, 'light', 'violet', '600').hex), 285)).toBeLessThan(0.5);
        expect(table(result, 'light').red['700']).not.toBe(table(defaults, 'light').red['700']);
        expect(failures(result)).toEqual([]);
    });

    it('lets hueOverrides win over the anchor curve', () => {
        const result = generatePrimitiveColorPalette({
            hueAnchors: { red: { '600': 35 } },
            hueOverrides: { red: { '600': 15 } },
        });
        expect(hueDiff(hueOf(chip(result, 'light', 'red', '600').hex), 15)).toBeLessThan(0.5);
    });

    it('anchors a basicColors palette by its lowercase name', () => {
        const result = generatePrimitiveColorPalette({
            basicColors: [{ name: 'Mint', hexcode: '#3CC8B4' }],
            hueAnchors: { mint: { '900': 200 } },
        });
        expect(hueDiff(hueOf(chip(result, 'light', 'mint', '900').hex), 200)).toBeLessThan(0.5);
    });

    it('matches the baseline with no anchors or the default ones', () => {
        expect(generatePrimitiveColorPalette({ hueAnchors: {} })).toEqual(defaults);
        expect(generatePrimitiveColorPalette({ hueAnchors: { blue: {} } })).toEqual(defaults);
        expect(generatePrimitiveColorPalette({ hueAnchors: { red: HUE_ANCHORS.red } })).toEqual(
            defaults,
        );
    });

    it.each([
        [{ nope: { '600': 10 } }, /Unknown palette/],
        [{ gray: { '600': 10 } }, /Unknown palette/],
        [{ constructor: { '900': 30 } }, /Unknown palette/],
        [{ red: { '500': 10 } }, /Invalid hue anchor step/],
        [{ red: { '600': Number.NaN } }, /must be a finite number/],
        [{ red: { '900': Infinity } }, /must be a finite number/],
        [{ red: { '900': '30' } }, /must be a finite number/],
    ])('rejects %j', (hueAnchors, message) => {
        expect(() =>
            generatePrimitiveColorPalette({ hueAnchors } as unknown as ThemeOptions),
        ).toThrow(message);
    });
});
