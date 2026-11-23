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

describe('validatePalette', () => {
    it('finds no failure in the default palette', () => {
        expect(validatePalette(defaults).filter((c) => c.status === 'fail')).toEqual([]);
    });

    it('fails a cell off its target contrast', () => {
        // red-500 in the red-600 cell: same chroma rule, wrong contrast
        expect(statuses(withHex(defaults, 'light', 'red', '600', light.red['500']))).toMatchObject({
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

    it('passes the chroma rule for seeded random brand colors', () => {
        // mulberry32: a fixed seed keeps the sample stable across runs
        let seed = 0x5eed;
        const random = () => {
            seed = (seed + 0x6d2b79f5) | 0;
            let t = Math.imul(seed ^ (seed >>> 15), seed | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 2 ** 32;
        };
        const failures = Array.from({ length: SWEEP }, () => {
            const hexcode = `#${Math.floor(random() * 0x1000000)
                .toString(16)
                .padStart(6, '0')}`;
            const result = generatePrimitiveColorPalette({
                brandColor: { name: 'brand', hexcode },
            });
            const { details } = validatePalette(result).find((c) => c.id === 'chroma')!;
            return details.map((d) => `${hexcode} ${d}`);
        }).flat();
        expect(failures).toEqual([]);
    }, 60_000); // 200 generations take ~11s, past the 5s default

    it('exempts the brand cell from the target contrast', () => {
        const result = generatePrimitiveColorPalette({
            brandColor: { name: 'brand', hexcode: '#2A72E5' },
        });
        expect(statuses(result)['target-contrast']).toBe('ok');
    });
});
