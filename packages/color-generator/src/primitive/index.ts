import { DEFAULT_CONTRAST_RATIOS } from '../constants';
import { generateThemeTokens } from '../libs/adobe-leonardo';
import type { ColorGeneratorConfig, ColorPaletteCollection } from '../types';
import { createBaseColorTokens, formatOklchForWeb } from '../utils/color';

// ============================================================================
// Default Primitive Color Palette
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
    const colors = config.colors || DEFAULT_PRIMITIVE_COLORS;
    const contrastRatios = config.contrastRatios || DEFAULT_CONTRAST_RATIOS;

    return {
        base: createBaseColorTokens(formatOklchForWeb),
        light: generateThemeTokens(colors, contrastRatios, 'light'),
        dark: generateThemeTokens(colors, contrastRatios, 'dark'),
    };
}
