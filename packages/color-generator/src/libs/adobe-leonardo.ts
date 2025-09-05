import { BackgroundColor, Color, CssColor, Theme } from '@adobe/leonardo-contrast-colors';
import { differenceCiede2000, formatCss, formatHex, oklch } from 'culori';

import {
    type ColorGeneratorConfig,
    DEFAULT_MAIN_BACKGROUND_LIGHTNESS,
    type ThemeTokens,
    type ThemeType,
    formatOklchForWeb,
} from '../core';

type OklchColor = {
    mode: 'oklch';
    l: number;
    c: number;
    h?: number;
};

// ============================================================================
// Utilities
// ============================================================================

const ADAPTIVE_COLOR_GENERATION = {
    LIGHTNESS_THRESHOLD: 0.5,
    DARK_LIGHTNESS_FACTOR: 0.55,
    LIGHT_LIGHTNESS_FACTOR: 0.85,
    CHROMA_REDUCTION_FACTOR: 0.85,
} as const;

/**
 * 입력 색상의 명도를 분석하여 최적의 Light/Dark Key 쌍을 생성합니다.
 * - 밝은 색상 (L > 0.5): 어두운 Key를 생성하여 duoKey 구성
 * - 어두운 색상 (L ≤ 0.5): 밝은 Key를 생성하여 duoKey 구성
 */
const createAdaptiveColorKeys = (
    brandColorOklch: OklchColor,
    originalHex: string,
): { lightKey: CssColor; darkKey: CssColor } => {
    const isLightColor = brandColorOklch.l > ADAPTIVE_COLOR_GENERATION.LIGHTNESS_THRESHOLD;

    if (isLightColor) {
        // 밝은 색상: 어두운 Key 생성
        const darkerKeyOklch: OklchColor = {
            ...brandColorOklch,
            mode: 'oklch',
            l: brandColorOklch.l * ADAPTIVE_COLOR_GENERATION.DARK_LIGHTNESS_FACTOR,
            c: brandColorOklch.c * ADAPTIVE_COLOR_GENERATION.CHROMA_REDUCTION_FACTOR,
        };

        const darkKeyHex = formatHex(darkerKeyOklch);
        return {
            lightKey: originalHex as CssColor,
            darkKey: (darkKeyHex ?? originalHex) as CssColor,
        };
    } else {
        // 어두운 색상: 밝은 Key 생성
        const lighterKeyOklch: OklchColor = {
            ...brandColorOklch,
            mode: 'oklch',
            l: Math.min(
                brandColorOklch.l / ADAPTIVE_COLOR_GENERATION.DARK_LIGHTNESS_FACTOR,
                ADAPTIVE_COLOR_GENERATION.LIGHT_LIGHTNESS_FACTOR,
            ),
            c: brandColorOklch.c * ADAPTIVE_COLOR_GENERATION.CHROMA_REDUCTION_FACTOR,
        };

        const lightKeyHex = formatHex(lighterKeyOklch);
        return {
            lightKey: (lightKeyHex ?? originalHex) as CssColor,
            darkKey: originalHex as CssColor,
        };
    }
};

/**
 * Adobe Leonardo Color 정의 생성
 * 브랜드 컬러를 기반으로 adaptive light/dark key pair를 생성하여 Leonardo Color 객체를 만듭니다.
 */
const createColorDefinition = ({
    name,
    colorHex,
    contrastRatios,
}: {
    name: string;
    colorHex: string;
    contrastRatios: Record<string, number>;
}): Color | null => {
    const brandColorOklch = oklch(colorHex);
    if (!brandColorOklch) {
        console.warn(`Invalid brand color: ${name} - ${colorHex}. Skipping.`);
        return null;
    }

    const { lightKey, darkKey } = createAdaptiveColorKeys(brandColorOklch, colorHex);

    return new Color({
        name,
        colorKeys: [lightKey, darkKey],
        colorspace: 'OKLCH',
        ratios: contrastRatios,
    });
};

/**
 * Adobe Leonardo Theme 생성
 * Color definitions와 configuration을 기반으로 Leonardo Theme을 생성합니다.
 */
const createLeonardoTheme = (
    themeType: ThemeType,
    colorDefinitions: Color[],
    config: ColorGeneratorConfig,
): Theme => {
    const backgroundLightness = config.backgroundLightness || {
        ...DEFAULT_MAIN_BACKGROUND_LIGHTNESS,
    };
    const contrastRatios = config.contrastRatios || {};

    const lightness = backgroundLightness[themeType];
    const colorKey = (themeType === 'light' ? '#FFFFFF' : '#000000') as CssColor;

    const background = new BackgroundColor({
        name: 'gray',
        colorKeys: [colorKey],
        ratios: contrastRatios,
    });

    return new Theme({
        colors: [...colorDefinitions, background],
        backgroundColor: background,
        lightness,
        output: 'HEX',
    });
};

// ============================================================================
// Public API
// ============================================================================

const generateThemeTokens = (
    colors: Record<string, string>,
    contrast: Record<string, number>,
    themeType: ThemeType = 'light',
): ThemeTokens => {
    const colorDefinitions = Object.entries(colors)
        .map(([name, hex]) =>
            createColorDefinition({ name, colorHex: hex, contrastRatios: contrast }),
        )
        .filter((def): def is Color => def !== null);

    const config: ColorGeneratorConfig = {
        backgroundLightness: DEFAULT_MAIN_BACKGROUND_LIGHTNESS,
        contrastRatios: contrast,
    };

    const theme = createLeonardoTheme(themeType, colorDefinitions, config);
    const [backgroundObj, ...themeColors] = theme.contrastColors;

    const calculateDeltaE = differenceCiede2000();

    const result: ThemeTokens = {
        background: {
            canvas: { hex: '', oklch: '' },
        },
    };

    // Background Color
    if ('background' in backgroundObj) {
        const oklchColor = oklch(backgroundObj.background);
        const oklchValue = formatCss(oklchColor);

        if (oklchValue) {
            result.background.canvas = {
                hex: backgroundObj.background,
                oklch: formatOklchForWeb(oklchValue),
            };
        }
    }

    // Key Colors
    themeColors.forEach((color) => {
        if ('name' in color && 'values' in color && color.values.length > 0) {
            const colorName = color.name;
            const originalColorHex = colors[colorName];

            const shadeData: Array<{ name: string; hex: string; oklch: string; deltaE: number }> =
                [];

            color.values.forEach((instance) => {
                const oklchColor = oklch(instance.value);
                const oklchValue = formatCss(oklchColor);

                if (oklchValue) {
                    let deltaE: number | undefined = undefined;
                    if (originalColorHex) {
                        deltaE =
                            Math.round(calculateDeltaE(originalColorHex, instance.value) * 100) /
                            100;
                    }

                    shadeData.push({
                        name: instance.name,
                        hex: instance.value,
                        oklch: formatOklchForWeb(oklchValue),
                        deltaE: deltaE || 0,
                    });
                }
            });

            shadeData.sort((a, b) => {
                const numA = parseInt(a.name, 10);
                const numB = parseInt(b.name, 10);
                return numA - numB;
            });

            const colorObj: Record<string, any> = {};
            shadeData.forEach((shade) => {
                colorObj[shade.name] = {
                    hex: shade.hex,
                    oklch: shade.oklch,
                    deltaE: shade.deltaE,
                };
            });
            result[colorName] = colorObj;
        }
    });

    return result;
};

// ============================================================================
// Exports
// ============================================================================

export { createColorDefinition, createAdaptiveColorKeys, createLeonardoTheme, generateThemeTokens };
