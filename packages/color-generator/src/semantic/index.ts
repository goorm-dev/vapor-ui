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
 * Creates semantic color definitions from a color configuration
 */
function createSemanticColorDefinitions(
    semanticColors: Record<string, string>,
    contrastRatios: Record<string, number>,
): Color[] {
    return Object.entries(semanticColors)
        .map(([name, colorHex]) => createColorDefinition({ name, colorHex, contrastRatios }))
        .filter((c): c is Color => c !== null);
}

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

    const semanticColorDefinitions = createSemanticColorDefinitions(semanticColors, contrastRatios);

    return {
        base: createBaseColorTokens(formatOklchForWeb),
        light: generateThemeTokens('light', semanticColorDefinitions, config, formatOklchForWeb),
        dark: generateThemeTokens('dark', semanticColorDefinitions, config, formatOklchForWeb),
    };
}

