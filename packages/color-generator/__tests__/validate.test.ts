import { describe, expect, it } from 'vitest';

import { generatePrimitiveColorPalette, validatePalette } from '../src';
import { hexToOklch, oklchToLinRgb, toHex } from '../src/domain/color-math';
import { table, withHex } from './helpers';

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

    it('exempts the brand cell from the target contrast', () => {
        const result = generatePrimitiveColorPalette({
            brandColor: { name: 'brand', hexcode: '#2A72E5' },
        });
        expect(statuses(result)['target-contrast']).toBe('ok');
    });
});
