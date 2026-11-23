import { describe, expect, it } from 'vitest';

import type { ThemeResult } from '../src';
import { generatePrimitiveColorPalette, validatePalette } from '../src';
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

    it('ignores gray and unknown names', () => {
        const out = generatePrimitiveColorPalette({
            hueOverrides: { gray: { '500': 120 }, nope: { '500': 120 } },
        });
        expect(out).toEqual(defaults);
    });

    it('matches the baseline with no or empty overrides', () => {
        expect(generatePrimitiveColorPalette({ hueOverrides: {} })).toEqual(defaults);
        expect(generatePrimitiveColorPalette({ hueOverrides: { blue: {} } })).toEqual(defaults);
        expect(generatePrimitiveColorPalette({ hueOverrides: undefined })).toEqual(defaults);
    });
});
