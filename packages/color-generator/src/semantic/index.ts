import {
    type ColorGeneratorConfig,
    type ColorPaletteCollection,
    DEFAULT_CONTRAST_RATIOS,
    createBaseColorTokens,
    formatOklchForWeb,
} from '../core';
import { generateThemeTokens } from '../libs/adobe-leonardo';

// ============================================================================
// Semantic Color Configuration
// ============================================================================

export interface SemanticColorConfig extends ColorGeneratorConfig {
    colors: {
        primary: string;
        secondary?: string;
        success?: string;
        warning?: string;
        error?: string;
        hint?: string;
        contrast?: string;
    };
}

// ============================================================================
// Semantic Color Generation Logic
// ============================================================================

/**
 * Generate semantic color palette with primary and optional semantic colors
 */
export function generateSemanticColorPalette(config: SemanticColorConfig): ColorPaletteCollection {
    const contrastRatios = config.contrastRatios || DEFAULT_CONTRAST_RATIOS;

    return {
        base: createBaseColorTokens(formatOklchForWeb),
        light: generateThemeTokens(config.colors, contrastRatios, 'light'),
        dark: generateThemeTokens(config.colors, contrastRatios, 'dark'),
    };
}
