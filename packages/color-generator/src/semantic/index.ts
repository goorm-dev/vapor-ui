import { formatCss, oklch } from 'culori';

import {
    type ColorGeneratorConfig,
    type ColorPaletteCollection,
    DEFAULT_CONTRAST_RATIOS,
    type ThemeTokens,
    createBaseColorTokens,
    formatOklchForWeb,
} from '../core';
import { generateThemeTokens } from '../libs/adobe-leonardo';

// ============================================================================
//
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
// Utilities
// ============================================================================
function applyCustomColors(
    themeTokens: ThemeTokens,
    customColors: Record<string, string>,
): ThemeTokens {
    const newThemeTokens: ThemeTokens = JSON.parse(JSON.stringify(themeTokens));

    for (const [colorName, hexValue] of Object.entries(customColors)) {
        const palette = newThemeTokens[colorName];

        if (!palette || colorName === 'background') {
            console.warn(`Palette for "${colorName}" not found or is invalid in themeTokens.`);
            continue;
        }

        const scaleKeys = Object.keys(palette);
        if (scaleKeys.length === 0) continue;

        const closestScaleKey = scaleKeys.reduce((closestKey, currentKey) => {
            const closestDeltaE = palette[closestKey]?.deltaE ?? Infinity;
            const currentDeltaE = palette[currentKey]?.deltaE ?? Infinity;
            return currentDeltaE < closestDeltaE ? currentKey : closestKey;
        });

        if (closestScaleKey) {
            const oklchColor = oklch(hexValue);
            const oklchValue = formatCss(oklchColor) || '';
            const oklchString = formatOklchForWeb(oklchValue);

            palette[closestScaleKey] = {
                deltaE: 0,
                hex: hexValue,
                oklch: oklchString,
            };
        }
    }

    return newThemeTokens;
}

// ============================================================================
// Semantic Color Generation Logic
// ============================================================================

export function generateSemanticColorPalette(config: SemanticColorConfig): ColorPaletteCollection {
    const contrastRatios = config.contrastRatios || DEFAULT_CONTRAST_RATIOS;

    const adjustedLightColorTokens = applyCustomColors(
        generateThemeTokens(config.colors, contrastRatios, 'light'),
        config.colors,
    );

    return {
        base: createBaseColorTokens(formatOklchForWeb),
        light: adjustedLightColorTokens,
        dark: generateThemeTokens(config.colors, contrastRatios, 'dark'),
    };
}
