import { formatCss, oklch } from 'culori';

import { DEFAULT_CONTRAST_RATIOS } from '../constants';
import { generateThemeTokens } from '../libs/adobe-leonardo';
import type {
    ColorGeneratorConfig,
    ColorPaletteCollection,
    ScaleInfo,
    ThemeTokens,
} from '../types';
import { createBaseColorTokens, formatOklchForWeb } from '../utils/color';

// ============================================================================
// Types, Tokens & Configuration
// ============================================================================

export interface SemanticColorGeneratorConfig extends ColorGeneratorConfig {
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

export type SemanticColorName = 'primary' | 'secondary' | 'success' | 'warning' | 'error';

export type SemanticDependentTokenMap<TColorName extends string> = Record<
    ReturnType<typeof createSemanticTokenKeys<TColorName>>[keyof ReturnType<
        typeof createSemanticTokenKeys<TColorName>
    >],
    string
>;

export type SemanticTokenMap = {
    [K in SemanticColorName]?: SemanticDependentTokenMap<K>;
};

export interface CurrentSemanticTokenMap {
    primary: SemanticDependentTokenMap<'primary'>;
}

export interface ThemeDependentTokensCollection {
    light: CurrentSemanticTokenMap;
    dark: CurrentSemanticTokenMap;
}

export const createSemanticTokenKeys = <T extends string>(colorName: T) => {
    return {
        Background: `background-${colorName}` as const,
        Foreground100: `foreground-${colorName}-100` as const,
        Foreground200: `foreground-${colorName}-200` as const,
        Border: `border-${colorName}` as const,
        ButtonForeground: `button-foreground-${colorName}` as const,
    };
};

export const PRIMARY_TOKEN_KEYS = createSemanticTokenKeys('primary');

export type CreateSemanticTokenKeys<T extends SemanticColorName> = ReturnType<
    typeof createSemanticTokenKeys<T>
>;
export type GetSemanticTokenMap<T extends SemanticColorName> = SemanticDependentTokenMap<T>;

export const isValidSemanticColor = (colorName: string): colorName is SemanticColorName => {
    const validColors: SemanticColorName[] = [
        'primary',
        'secondary',
        'success',
        'warning',
        'error',
    ];
    return validColors.includes(colorName as SemanticColorName);
};

// ============================================================================
// Internal Processing Logic
// ============================================================================

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
        // 'background'는 특별한 시스템 색상이므로 커스텀 색상 처리에서 제외
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
        };
    }

    return newThemeTokens;
}

function getSortedScales(palette: Record<string, unknown>): string[] {
    return Object.keys(palette).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
}

function findLightThemeScales(
    palette: Record<string, { deltaE?: number }>,
    scales: string[],
): ScaleInfo {
    const backgroundScale = scales.find((scale) => palette[scale]?.deltaE === 0);
    if (!backgroundScale) {
        throw new Error('No scale with deltaE 0 found for light theme background-primary');
    }

    const backgroundIndex = scales.indexOf(backgroundScale);
    const foregroundScale = scales[backgroundIndex + 1] ?? backgroundScale;
    const alternativeScale = scales[backgroundIndex + 2] ?? foregroundScale;

    return { backgroundScale, foregroundScale, alternativeScale };
}

function findDarkThemeScales(
    palette: Record<string, { deltaE?: number }>,
    scales: string[],
): ScaleInfo {
    const backgroundScale = scales.reduce((lowest, current) => {
        const lowestDeltaE = palette[lowest]?.deltaE ?? Infinity;
        const currentDeltaE = palette[current]?.deltaE ?? Infinity;
        return currentDeltaE < lowestDeltaE ? current : lowest;
    });

    const backgroundIndex = scales.indexOf(backgroundScale);
    const foregroundScale = scales[backgroundIndex + 1] ?? backgroundScale;
    const alternativeScale = scales[backgroundIndex + 2] ?? foregroundScale;

    return {
        backgroundScale,
        foregroundScale,
        alternativeScale,
    };
}

function createSemanticTokenMap<T extends string>(
    colorName: T,
    scaleInfo: ScaleInfo,
    tokenKeys: ReturnType<typeof createSemanticTokenKeys<T>>,
): SemanticDependentTokenMap<T> {
    return {
        [tokenKeys.Background]: `color-${colorName}-${scaleInfo.backgroundScale}`,
        [tokenKeys.Foreground100]: `color-${colorName}-${scaleInfo.foregroundScale}`,
        [tokenKeys.Foreground200]: `color-${colorName}-${scaleInfo.alternativeScale}`,
        [tokenKeys.Border]: `color-${colorName}-${scaleInfo.backgroundScale}`,
        [tokenKeys.ButtonForeground]: 'black',
    } as SemanticDependentTokenMap<T>;
}

// ============================================================================
// Public API
// ============================================================================

export function generateSemanticColorPalette(
    config: SemanticColorGeneratorConfig,
): ColorPaletteCollection {
    const contrastRatios = config.contrastRatios || DEFAULT_CONTRAST_RATIOS;

    // NOTE: In the "light" theme, find the closest scale to the custom color and overwrite it.
    const adjustedLightColorTokens = overrideCustomColors(
        generateThemeTokens(config.colors, contrastRatios, 'light'),
        config.colors,
    );

    return {
        base: createBaseColorTokens(formatOklchForWeb),
        light: adjustedLightColorTokens,
        dark: generateThemeTokens(config.colors, contrastRatios, 'dark'),
    };
}

/**
 * 시맨틱 컬러 팔레트를 기반으로 테마별 의존 토큰을 생성합니다.
 * 현재는 primary만 지원하며, 향후 secondary, success 등을 확장 예정입니다.
 */
export function generateSemanticDependentTokens(
    semanticColorPalette: ColorPaletteCollection,
): ThemeDependentTokensCollection {
    const lightPrimaryPalette = semanticColorPalette.light.primary;
    const darkPrimaryPalette = semanticColorPalette.dark.primary;

    if (!lightPrimaryPalette) {
        throw new Error('Light primary palette not found in theme tokens');
    }
    if (!darkPrimaryPalette) {
        throw new Error('Dark primary palette not found in theme tokens');
    }

    const lightScales = getSortedScales(lightPrimaryPalette);
    const darkScales = getSortedScales(darkPrimaryPalette);

    const lightScaleInfo = findLightThemeScales(lightPrimaryPalette, lightScales);
    const darkScaleInfo = findDarkThemeScales(darkPrimaryPalette, darkScales);

    return {
        light: { primary: createSemanticTokenMap('primary', lightScaleInfo, PRIMARY_TOKEN_KEYS) },
        dark: { primary: createSemanticTokenMap('primary', darkScaleInfo, PRIMARY_TOKEN_KEYS) },
    };
}
