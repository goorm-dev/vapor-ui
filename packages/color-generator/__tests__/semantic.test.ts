import { describe, expect, it } from 'vitest';

import { generatePrimitiveColorPalette, getSemanticDependentTokens, validatePalette } from '../src';

const withBrand = (hexcode: string) =>
    generatePrimitiveColorPalette({ brandColor: { name: 'brand', hexcode } });
const statusOf = (result: ReturnType<typeof withBrand>, id: string) =>
    validatePalette(result).find((c) => c.id === id)!.status;

describe('getSemanticDependentTokens', () => {
    it('maps the default palette with blue as primary', () => {
        const { lightModeTokens, darkModeTokens } = getSemanticDependentTokens(
            generatePrimitiveColorPalette(),
        );
        expect(lightModeTokens).toEqual({
            'color-background-primary-100': 'color-blue-100',
            'color-background-primary-200': 'color-blue-500',
            'color-border-primary': 'color-blue-500',
            'color-border-normal': 'color-gray-100',
            'color-foreground-primary-100': 'color-blue-600',
            'color-foreground-primary-200': 'color-blue-700',
            'color-background-canvas-100': 'color-gray-000',
            'color-background-canvas-200': 'color-gray-050',
            'color-background-overlay-100': 'color-gray-000',
            'color-foreground-inverse': 'color-white',
            'color-foreground-onPrimary': 'color-white',
        });
        expect(darkModeTokens).toEqual({
            'color-background-primary-100': 'color-blue-050',
            'color-background-primary-200': 'color-blue-400',
            'color-border-primary': 'color-blue-400',
            'color-border-normal': 'color-gray-300',
            'color-foreground-primary-100': 'color-blue-500',
            'color-foreground-primary-200': 'color-blue-600',
            'color-background-canvas-100': 'color-gray-025',
            'color-background-canvas-200': 'color-gray-050',
            'color-background-overlay-100': 'color-gray-050',
            'color-foreground-inverse': 'color-black',
            'color-foreground-onPrimary': 'color-white',
        });
    });

    it('throws for a missing primary palette', () => {
        expect(() =>
            getSemanticDependentTokens(generatePrimitiveColorPalette(), 'brand'),
        ).toThrow();
    });

    it('lowercases the brand name and the primary name', () => {
        const result = generatePrimitiveColorPalette({
            brandColor: { name: 'Acme', hexcode: '#2A72E5' },
        });
        expect(result.brand?.name).toBe('acme');
        expect(result.lightModeTokens.palettes.map((p) => p.name)).toContain('acme');
        expect(
            getSemanticDependentTokens(result, 'Acme').lightModeTokens[
                'color-background-primary-200'
            ],
        ).toBe('color-acme-400');
    });

    describe('brand as primary', () => {
        it('anchors on a light brand cell at 200 with black on-primary text and warns', () => {
            const result = withBrand('#94CCF9');
            const { lightModeTokens, darkModeTokens } = getSemanticDependentTokens(result, 'brand');
            expect(result.brand?.scale).toBe('200');
            expect(lightModeTokens['color-background-primary-200']).toBe('color-brand-200');
            expect(lightModeTokens['color-foreground-primary-100']).toBe('color-brand-300');
            expect(lightModeTokens['color-foreground-primary-200']).toBe('color-brand-400');
            expect(lightModeTokens['color-foreground-onPrimary']).toBe('color-black');
            expect(statusOf(result, 'primary-anchor')).toBe('warn');
            // 9.18 against #232323 is nearest dark 700
            expect(darkModeTokens['color-background-primary-200']).toBe('color-brand-700');
            expect(darkModeTokens['color-foreground-onPrimary']).toBe('color-black');
        });

        it('uses white on-primary text for a dark brand cell and caps steps at 900', () => {
            const result = withBrand('#1A2B6B');
            const { lightModeTokens } = getSemanticDependentTokens(result, 'brand');
            expect(result.brand?.scale).toBe('800');
            expect(lightModeTokens['color-foreground-onPrimary']).toBe('color-white');
            expect(lightModeTokens['color-foreground-primary-100']).toBe('color-brand-900');
            expect(lightModeTokens['color-foreground-primary-200']).toBe('color-brand-900');
        });

        it('maps #2A72E5 to light 400 and dark 400, both with white text', () => {
            const { lightModeTokens, darkModeTokens } = getSemanticDependentTokens(
                withBrand('#2A72E5'),
                'brand',
            );
            expect(lightModeTokens['color-background-primary-200']).toBe('color-brand-400');
            expect(lightModeTokens['color-foreground-onPrimary']).toBe('color-white');
            expect(darkModeTokens['color-background-primary-200']).toBe('color-brand-400');
            expect(darkModeTokens['color-foreground-onPrimary']).toBe('color-white');
        });
    });
});
