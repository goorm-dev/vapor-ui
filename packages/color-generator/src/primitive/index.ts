import { formatCss, oklch } from 'culori';

import { DEFAULT_CONTRAST_RATIOS } from '../constants';
import { generateThemeTokens } from '../libs/adobe-leonardo';
import type { ColorGeneratorConfig, ColorPaletteCollection, ThemeTokens } from '../types';
import { createBaseColorTokens, formatOklchForWeb, generateCodeSyntax } from '../utils/color';

/* -------------------------------------------------------------------------------------------------
 * Default Primitive Color Palette
 * -----------------------------------------------------------------------------------------------*/

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

/* -------------------------------------------------------------------------------------------------
 * Primitive Color Generation Logic
 * -----------------------------------------------------------------------------------------------*/

export function generateSystemColorPalette(
    config: ColorGeneratorConfig = {},
): ColorPaletteCollection {
    const colors = config.colors || DEFAULT_PRIMITIVE_COLORS;
    const contrastRatios = config.contrastRatios || DEFAULT_CONTRAST_RATIOS;

    return {
        base: createBaseColorTokens(formatOklchForWeb),
        light: generateThemeTokens(colors, contrastRatios, 'light'),
        dark: generateThemeTokens(colors, contrastRatios, 'dark'),
    };
}

/* -------------------------------------------------------------------------------------------------
 * Brand Color Generation (Primitive Tokens)
 * -----------------------------------------------------------------------------------------------*/

export interface BrandColorGeneratorConfig extends ColorGeneratorConfig {
    colors: {
        [colorName: string]: string;
    };
}

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

function findClosestScale(palette: Record<string, { deltaE?: number }>): string | null {
    const scaleKeys = Object.keys(palette);
    if (scaleKeys.length === 0) return null;

    return scaleKeys.reduce((closestKey, currentKey) => {
        const closestDeltaE = palette[closestKey]?.deltaE ?? Infinity;
        const currentDeltaE = palette[currentKey]?.deltaE ?? Infinity;
        return currentDeltaE < closestDeltaE ? currentKey : closestKey;
    });
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

export function generateBrandColorPalette(
    config: BrandColorGeneratorConfig,
): Pick<ColorPaletteCollection, 'light' | 'dark'> {
    const contrastRatios = config.contrastRatios || DEFAULT_CONTRAST_RATIOS;

    // NOTE: In the "light" theme, find the closest scale to the custom color and overwrite it.
    const adjustedLightColorTokens = overrideCustomColors(
        generateThemeTokens(config.colors, contrastRatios, 'light'),
        config.colors,
    );

    const lightTokens = adjustedLightColorTokens;
    const darkTokens = generateThemeTokens(config.colors, contrastRatios, 'dark');

    // Remove 'gray' from both themes if it exists
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
