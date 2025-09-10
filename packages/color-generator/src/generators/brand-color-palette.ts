import { formatCss, oklch } from 'culori';

import { DEFAULT_CONTRAST_RATIOS } from '../constants';
import { generateThemeTokens } from '../libs';
import type { BrandColorGeneratorConfig, ColorPaletteCollection, ThemeTokens } from '../types';
import { findClosestScale, formatOklchForWeb, generateCodeSyntax } from '../utils';

function deepCloneThemeTokens(themeTokens: ThemeTokens): ThemeTokens {
    const cloned: ThemeTokens = { background: { ...themeTokens.background } };

    Object.entries(themeTokens).forEach(([colorName, palette]) => {
        if (colorName === 'background') return;

        cloned[colorName] = {};
        Object.entries(palette).forEach(([scale, token]) => {
            cloned[colorName][scale] = { ...token };
        });
    });

    return cloned;
}

function overrideCustomColors(
    themeTokens: ThemeTokens,
    customColors: Record<string, string>,
): ThemeTokens {
    const newThemeTokens = deepCloneThemeTokens(themeTokens);

    for (const [colorName, hexValue] of Object.entries(customColors)) {
        if (colorName === 'background') continue;

        const palette = newThemeTokens[colorName];
        if (!palette) {
            console.warn(`Palette for "${colorName}" not found in themeTokens.`);
            continue;
        }

        const closestScaleKey = findClosestScale(palette);
        if (!closestScaleKey) continue;

        const oklchColor = oklch(hexValue);
        const oklchValue = formatCss(oklchColor) ?? '';
        const oklchString = formatOklchForWeb(oklchValue);

        palette[closestScaleKey] = {
            deltaE: 0,
            hex: hexValue,
            oklch: oklchString,
            codeSyntax: generateCodeSyntax([colorName, closestScaleKey]),
        };
    }

    return newThemeTokens;
}

function generateBrandColorPalette(
    config: BrandColorGeneratorConfig,
): Pick<ColorPaletteCollection, 'light' | 'dark'> {
    const contrastRatios = config.contrastRatios || DEFAULT_CONTRAST_RATIOS;

    const adjustedLightColorTokens = overrideCustomColors(
        generateThemeTokens(config.colors, contrastRatios, 'light'),
        config.colors,
    );

    const lightTokens = adjustedLightColorTokens;
    const darkTokens = generateThemeTokens(config.colors, contrastRatios, 'dark');

    if ('gray' in lightTokens) {
        delete lightTokens.gray;
    }
    if ('gray' in darkTokens) {
        delete darkTokens.gray;
    }

    return {
        light: lightTokens,
        dark: darkTokens,
    };
}

/* -----------------------------------------------------------------------------------------------*/

export { generateBrandColorPalette };
