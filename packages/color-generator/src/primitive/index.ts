
import {
    type ColorGeneratorConfig,
    type ColorPaletteCollection,
    DEFAULT_CONTRAST_RATIOS,
    createBaseColorTokens,
    formatOklchForWeb,
} from '../core';
import { generateThemeTokens } from '../libs/adobe-leonardo';

// ============================================================================
// Primitive Colors Configuration
// ============================================================================

export const DEFAULT_PRIMITIVE_COLORS = {
    red: '#F5535E',
    pink: '#F26394',
    grape: '#CC5DE8',
    violet: '#8662F3',
    blue: '#448EFE',
    cyan: '#1EBAD2',
    green: '#04A37E',
    lime: '#1EBAD2',
    yellow: '#FFC107',
    orange: '#ED670C',
} as const;

// ============================================================================
// Primitive Color Generation Logic
// ============================================================================


export function generateColorPalette(config: ColorGeneratorConfig = {}): ColorPaletteCollection {
    const primitiveColors = config.primitiveColors || DEFAULT_PRIMITIVE_COLORS;
    const contrastRatios = config.contrastRatios || DEFAULT_CONTRAST_RATIOS;


    return {
        base: createBaseColorTokens(formatOklchForWeb),
        light: generateThemeTokens(primitiveColors, contrastRatios, 'light'),
        dark: generateThemeTokens(primitiveColors, contrastRatios, 'dark'),
    };
}
