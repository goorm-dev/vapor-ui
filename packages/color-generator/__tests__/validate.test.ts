import { describe, expect, it } from 'vitest';

import { generatePrimitiveColorPalette, validatePalette } from '../src';
import { hexToOklch, oklchToLinRgb, toHex } from '../src/domain/color-math';
import { table, withHex } from './helpers';

// Before the dark chroma fix, 60 seeds held 3 failures (dark 400 twice, dark 900 once at #acfd43).
const SWEEP = 200;
const defaults = generatePrimitiveColorPalette();
const light = table(defaults, 'light');
const statuses = (result: typeof defaults) =>
    Object.fromEntries(validatePalette(result).map((c) => [c.id, c.status]));

const STEPS = ['400', '500', '600', '700', '800', '900'];
/**
 * Light 500–800 cells whose chroma passes their neighbours' mean by more than 0.03. Triples
 * holding the pinned brand cell are skipped: that HEX is user input, not generated, and a
 * low-chroma pin makes its generated neighbours read as spikes (41 such cells in the sweep).
 */
const chromaSpikes = (result: typeof defaults) =>
    Object.entries(table(result, 'light')).flatMap(([color, row]) => {
        const c = (i: number) => hexToOklch(row[STEPS[i]])[1];
        const pinned = (i: number) =>
            color === result.brand?.name && Math.abs(STEPS.indexOf(result.brand.scale) - i) <= 1;
        return [1, 2, 3, 4]
            .filter((i) => !pinned(i) && c(i) - (c(i - 1) + c(i + 1)) / 2 > 0.03)
            .map((i) => `light ${color}-${STEPS[i]} chroma spike`);
    });

describe('validatePalette', () => {
    it('finds no failure in the default palette', () => {
        expect(validatePalette(defaults).filter((c) => c.status === 'fail')).toEqual([]);
    });

    it('finds no hue gap and no light chroma spike in the default palette', () => {
        expect(validatePalette(defaults).find((c) => c.id === 'hue-gap')!.details).toEqual([]);
        expect(chromaSpikes(defaults)).toEqual([]);
    });

    it('fails a cell off its target contrast', () => {
        // green-500 in the green-600 cell: within the chroma rule, wrong contrast
        expect(
            statuses(withHex(defaults, 'light', 'green', '600', light.green['500'])),
        ).toMatchObject({
            'target-contrast': 'fail',
            a11y: 'ok',
            chroma: 'ok',
        });
    });

    it('fails a cell under its accessibility floor', () => {
        expect(statuses(withHex(defaults, 'light', 'red', '500', light.red['400'])).a11y).toBe(
            'fail',
        );
    });

    it('fails a cell off its chroma rule', () => {
        const [L, C, H] = hexToOklch(light.red['700']);
        const dull = toHex(oklchToLinRgb(L, C / 2, H));
        expect(statuses(withHex(defaults, 'light', 'red', '700', dull)).chroma).toBe('fail');
    });

    it('warns on close hues with one line per pair naming both cells', () => {
        const red700 = hexToOklch(light.red['700'])[2];
        const close = generatePrimitiveColorPalette({
            hueOverrides: { orange: { '700': red700 + 1 } },
        });
        const { status, details } = validatePalette(close).find((c) => c.id === 'hue-gap')!;
        expect(status).toBe('warn');
        expect(details.length).toBeGreaterThan(0);
        for (const detail of details)
            expect(detail).toMatch(
                /^(light|dark) [a-z-]+-(\d{3}) · \1 [a-z-]+-\2: hue gap \d+\.\d° \(min 5\.5°\)$/,
            );
        expect(details.some((d) => d.startsWith('light red-700 · light orange-700:'))).toBe(true);
    });

    it('exempts blue and cobalt from the hue gap', () => {
        const result = withHex(defaults, 'light', 'cobalt', '500', light.blue['500']);
        const { details } = validatePalette(result).find((c) => c.id === 'hue-gap')!;
        expect(details.some((d) => d.includes('blue-500') && d.includes('cobalt-500'))).toBe(false);
    });

    it('warns when a brand cell breaks the contrast order', () => {
        const result = generatePrimitiveColorPalette({
            brandColor: { name: 'brand', hexcode: '#2A72E5' },
        });
        const brand = table(result, 'light').brand;
        expect(statuses(result)['brand-monotone']).toBe('ok');
        expect(
            statuses(withHex(result, 'light', 'brand', '300', brand['500']))['brand-monotone'],
        ).toBe('warn');
    });

    it.each(['#F0F0F0', '#5AED87', '#777777', '#93778F'])(
        'passes the chroma rule with brand %s',
        (hexcode) => {
            const result = generatePrimitiveColorPalette({
                brandColor: { name: 'brand', hexcode },
            });
            expect(validatePalette(result).find((c) => c.id === 'chroma')?.details).toEqual([]);
        },
    );

    it('passes the chroma rule with no light chroma spike for seeded random brand colors', () => {
        // mulberry32: a fixed seed keeps the sample stable across runs
        let seed = 0x5eed;
        const random = () => {
            seed = (seed + 0x6d2b79f5) | 0;
            let t = Math.imul(seed ^ (seed >>> 15), seed | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 2 ** 32;
        };
        let hueGaps = 0;
        const failures = Array.from({ length: SWEEP }, () => {
            const hexcode = `#${Math.floor(random() * 0x1000000)
                .toString(16)
                .padStart(6, '0')}`;
            const result = generatePrimitiveColorPalette({
                brandColor: { name: 'brand', hexcode },
            });
            const checks = validatePalette(result);
            hueGaps += checks.find((c) => c.id === 'hue-gap')!.details.length;
            const { details } = checks.find((c) => c.id === 'chroma')!;
            return [...details, ...chromaSpikes(result)].map((d) => `${hexcode} ${d}`);
        }).flat();
        console.info(`brand sweep: ${hueGaps} hue-gap warnings over ${SWEEP} brand colors`);
        expect(failures).toEqual([]);
    }, 60_000); // 200 generations take ~11s, past the 5s default

    it('exempts the brand cell from the target contrast', () => {
        const result = generatePrimitiveColorPalette({
            brandColor: { name: 'brand', hexcode: '#2A72E5' },
        });
        expect(statuses(result)['target-contrast']).toBe('ok');
    });
});
