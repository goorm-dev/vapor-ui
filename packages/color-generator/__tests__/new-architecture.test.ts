import { describe, expect, it } from 'vitest';

import {
    type ThemeOptions,
    generatePrimitiveColorPalette,
    getSemanticDependentTokens,
} from '../src';

describe('New Architecture Snapshot Tests', () => {
    describe('generatePrimitiveColorPalette', () => {
        it('should generate primitive color palette with default options', () => {
            const result = generatePrimitiveColorPalette();
            expect(result).toMatchSnapshot();
        });

        it('should generate palette with brand color', () => {
            const options: ThemeOptions = {
                brandColor: {
                    name: 'mint',
                    hexcode: '#00BEEF',
                },
            };

            const result = generatePrimitiveColorPalette(options);
            expect(result).toMatchSnapshot();
        });

        it('should handle custom background color', () => {
            const options: ThemeOptions = {
                brandColor: {
                    name: 'sunset',
                    hexcode: '#FF5733',
                },
                backgroundColor: {
                    name: 'beige',
                    hexcode: '#fcf6df',
                },
                lightness: {
                    light: 97,
                    dark: 0,
                },
            };

            const result = generatePrimitiveColorPalette(options);
            expect(result).toMatchSnapshot();
        });

        it('should validate invalid hex colors', () => {
            expect(() => {
                generatePrimitiveColorPalette({
                    brandColor: {
                        name: 'invalid',
                        hexcode: 'invalid-hex',
                    },
                });
            }).toThrow('Invalid brand color hex');
        });
    });

    describe('getSemanticDependentTokens', () => {
        it('should generate semantic tokens with standard brand color mapping', () => {
            const primitiveResult = generatePrimitiveColorPalette({
                brandColor: {
                    name: 'mint',
                    hexcode: '#00BEEF',
                },
            });

            const semanticResult = getSemanticDependentTokens(primitiveResult, 'mint');
            expect(semanticResult).toMatchSnapshot();
        });

        it('should apply semantic order inversion prevention for very light brand colors', () => {
            const primitiveResult = generatePrimitiveColorPalette({
                brandColor: {
                    name: 'lightRed',
                    hexcode: '#fff5f4',
                },
            });

            const semanticResult = getSemanticDependentTokens(primitiveResult, 'lightRed');
            expect(semanticResult).toMatchSnapshot();
        });

        it('should handle semantic token mapping for very dark brand colors', () => {
            const primitiveResult = generatePrimitiveColorPalette({
                brandColor: {
                    name: 'darkRed',
                    hexcode: '#570000',
                },
            });

            const semanticResult = getSemanticDependentTokens(primitiveResult, 'darkRed');
            expect(semanticResult).toMatchSnapshot();
        });
    });
});
