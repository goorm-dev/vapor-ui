import { Color } from '@adobe/leonardo-contrast-colors';

import {
    type ColorGeneratorConfig,
    type ColorPaletteCollection,
    DEFAULT_CONTRAST_RATIOS,
    createBaseColorTokens,
    formatOklchForWeb,
} from '../core';
import { createColorDefinition, generateThemeTokens } from '../libs/adobe-leonardo';

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

function createVaporColorDefinitions(
    primitiveColors: Record<string, string>,
    contrastRatios: Record<string, number>,
): Color[] {
    return Object.entries(primitiveColors)
        .map(([name, colorHex]) => createColorDefinition({ name, colorHex, contrastRatios }))
        .filter((c): c is Color => c !== null);
}

export function generateColorPalette(config: ColorGeneratorConfig = {}): ColorPaletteCollection {
    const primitiveColors = config.primitiveColors || DEFAULT_PRIMITIVE_COLORS;
    const contrastRatios = config.contrastRatios || DEFAULT_CONTRAST_RATIOS;

    const vaporColorDefinitions = createVaporColorDefinitions(primitiveColors, contrastRatios);

    return {
        base: createBaseColorTokens(formatOklchForWeb),
        light: generateThemeTokens('light', vaporColorDefinitions, config, formatOklchForWeb),
        dark: generateThemeTokens('dark', vaporColorDefinitions, config, formatOklchForWeb),
    };
}
