import { describe, expect, it } from 'vitest';

import gray from '../reference/gray.figma.json';
import reference from '../reference/palette.json';
import referenceTeal from '../reference/palette.teal.json';
import { BASE_TOKENS, HUE_ANCHORS, LEONARDO_KEYS, generatePrimitiveColorPalette } from '../src';
import { contrast, gamutChroma } from '../src/domain/color-math';
import { table } from './helpers';

const COLOR_SCALES = ['050', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
const BASE = Object.keys(reference.light);

const defaults = generatePrimitiveColorPalette();

const without = (t: Record<string, unknown>, ...names: string[]) =>
    Object.fromEntries(Object.entries(t).filter(([name]) => !names.includes(name)));

describe('reference script parity', () => {
    it('matches every cell of reference/palette.json', () => {
        expect(without(table(defaults, 'light'), 'gray')).toEqual(reference.light);
        expect(without(table(defaults, 'dark'), 'gray')).toEqual(reference.dark);
    });

    it('matches reference/palette.teal.json for a one-HEX basic color', () => {
        const result = generatePrimitiveColorPalette({
            basicColors: [{ name: 'teal', hexcode: '#00838F' }],
        });
        expect(without(table(result, 'light'), 'gray')).toEqual(referenceTeal.light);
        expect(without(table(result, 'dark'), 'gray')).toEqual(referenceTeal.dark);
    });

    it('matches the 24 Figma gray cells', () => {
        expect(table(defaults, 'light').gray).toEqual(gray.light);
        expect(table(defaults, 'dark').gray).toEqual(gray.dark);
    });

    it('finds the upper end of a split in-gamut chroma range (cobalt light-800)', () => {
        expect(gamutChroma(0.36522, 0.6, 264.13)).toBeCloseTo(0.2528782257881398, 10);
    });

    it('finds an in-gamut chroma range narrower than 0.0001', () => {
        // in gamut only between ~0.035914 and ~0.035946 above 0.0304
        expect(
            gamutChroma(0.05164011753828483, 0.06388623250356247, 263.8970700268121),
        ).toBeCloseTo(0.035946, 6);
    });
});

describe('output shape', () => {
    it('lists base colors, then basic colors, then the brand, then gray', () => {
        const result = generatePrimitiveColorPalette({
            basicColors: [
                { name: 'teal', hexcode: '#00838F' },
                { name: 'red', hexcode: '#F8636A' },
            ],
            brandColor: { name: 'acme', hexcode: '#FF6B00' },
        });
        expect(result.lightModeTokens.palettes.map((p) => p.name)).toEqual([
            ...BASE,
            'teal',
            'acme',
            'gray',
        ]);
    });

    it('formats chips as before', () => {
        const chip = defaults.lightModeTokens.palettes.find((p) => p.name === 'blue')!.chips['500'];
        expect(chip).toEqual({
            name: 'color-blue-500',
            hex: `#${reference.light.blue['500'].toLowerCase()}`,
            oklch: expect.stringMatching(/^oklch\(0\.\d+ 0\.\d+ \d+(\.\d+)?\)$/),
            codeSyntax: 'vapor-color-blue-500',
        });
        expect(defaults.brand).toBeUndefined();
    });

    it('rejects an invalid hex', () => {
        expect(() =>
            generatePrimitiveColorPalette({ brandColor: { name: 'acme', hexcode: 'red' } }),
        ).toThrow();
    });
});

describe('exported tables', () => {
    it('reject writes and keep the default output', () => {
        const writes = [
            () => ((HUE_ANCHORS.red as Record<string, number>)['900'] = 200),
            () => ((HUE_ANCHORS as Record<string, unknown>).teal = HUE_ANCHORS.cyan),
            () => ((LEONARDO_KEYS.red as unknown as string[])[1] = '000000'),
            () => ((BASE_TOKENS['color-white'] as { hex: string }).hex = '#000000'),
        ];
        for (const write of writes) expect(write).toThrow(TypeError);
        expect(generatePrimitiveColorPalette()).toEqual(defaults);
    });
});

describe('basic colors', () => {
    it('rejects a duplicate name within basic colors or shared with the brand', () => {
        const teal = { name: 'teal', hexcode: '#00838F' };
        expect(() => generatePrimitiveColorPalette({ basicColors: [teal, teal] })).toThrow(
            'Duplicate color name: teal',
        );
        expect(() =>
            generatePrimitiveColorPalette({ basicColors: [teal], brandColor: teal }),
        ).toThrow('Duplicate color name: teal');
    });

    it('lowercases names before the reserved and duplicate checks', () => {
        expect(() =>
            generatePrimitiveColorPalette({ basicColors: [{ name: 'Gray', hexcode: '#888888' }] }),
        ).toThrow('Invalid color name: gray');
        expect(() =>
            generatePrimitiveColorPalette({
                basicColors: [
                    { name: 'Blue', hexcode: '#00838F' },
                    { name: 'blue', hexcode: '#00838F' },
                ],
            }),
        ).toThrow('Duplicate color name: blue');
    });

    it('replacing a base color leaves the other colors unchanged', () => {
        const result = generatePrimitiveColorPalette({
            basicColors: [{ name: 'blue', hexcode: '#00838F' }],
        });
        expect(without(table(result, 'light'), 'blue', 'gray')).toEqual(
            without(reference.light, 'blue'),
        );
        expect(without(table(result, 'dark'), 'blue', 'gray')).toEqual(
            without(reference.dark, 'blue'),
        );
    });
});

describe('brand color', () => {
    const brandCell = (hexcode: string) => {
        const result = generatePrimitiveColorPalette({ brandColor: { name: 'brand', hexcode } });
        return {
            result,
            scale: result.brand!.scale,
            light: table(result, 'light').brand,
            dark: table(result, 'dark').brand,
        };
    };

    it.each([
        ['#FF6B00', '300'], // 2.86 against white, nearest 300
        ['#3B82F6', '400'],
        ['#2A72E5', '400'], // 500 is nearest but 4.53 < 4.821 fails 4.5:1 on gray-025
        ['#4A72B0', '500'], // 4.855, just above the 500 floor of 4.821
        ['#4D73AE', '400'], // 4.796: 500 fails, 600 (next nearest) breaks order, so 400
    ])('pins %s into light %s as-is', (hexcode, scale) => {
        const { result, light } = brandCell(hexcode);
        expect(result.brand).toEqual({ name: 'brand', scale });
        expect(light[scale]).toBe(hexcode.slice(1));
    });

    it('keeps the contrast order around the pinned cell', () => {
        const { scale, light } = brandCell('#4D73AE');
        const i = COLOR_SCALES.indexOf(scale);
        const c = (s: string) => contrast(light[s], 'FFFFFF');
        expect(c(COLOR_SCALES[i - 1])).toBeLessThan(c(scale));
        expect(c(scale)).toBeLessThan(c(COLOR_SCALES[i + 1]));
    });

    it('never pins the brand HEX in dark', () => {
        const { dark } = brandCell('#2A72E5');
        expect(Object.values(dark)).not.toContain('2A72E5');
    });

    it('replacing blue leaves the other colors 050–200 identical', () => {
        const result = generatePrimitiveColorPalette({
            brandColor: { name: 'blue', hexcode: '#FF6B00' },
        });
        for (const mode of ['light', 'dark'] as const) {
            const t = table(result, mode);
            for (const color of BASE.filter((c) => c !== 'blue'))
                for (const s of ['050', '100', '200'])
                    expect(t[color][s], `${mode} ${color}-${s}`).toBe(
                        reference[mode][color as 'red'][s as '050'],
                    );
        }
    });
});
