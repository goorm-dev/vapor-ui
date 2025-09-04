
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

/**
 * Comprehensive semantic color configuration
 */
export interface SemanticColorConfig extends Omit<ColorGeneratorConfig, 'primitiveColors'> {
    primaryColor: string;
    secondaryColor?: string;
    successColor?: string;
    errorColor?: string;
    warningColor?: string;
    infoColor?: string;
    accentColor?: string;
}

// ============================================================================
// Semantic Color Generation Logic
// ============================================================================


/**
 * Generate semantic color palette with primary and optional semantic colors
 */
export function generateSemanticColorPalette(config: SemanticColorConfig): ColorPaletteCollection {
    const contrastRatios = config.contrastRatios || DEFAULT_CONTRAST_RATIOS;

    const semanticColors: Record<string, string> = {
        primary: config.primaryColor,
    };

    // Add optional semantic colors
    if (config.secondaryColor) semanticColors.secondary = config.secondaryColor;
    if (config.successColor) semanticColors.success = config.successColor;
    if (config.errorColor) semanticColors.error = config.errorColor;
    if (config.warningColor) semanticColors.warning = config.warningColor;
    if (config.infoColor) semanticColors.info = config.infoColor;
    if (config.accentColor) semanticColors.accent = config.accentColor;


    return {
        base: createBaseColorTokens(formatOklchForWeb),
        light: generateThemeTokens(semanticColors, contrastRatios, 'light'),
        dark: generateThemeTokens(semanticColors, contrastRatios, 'dark'),
    };
}

