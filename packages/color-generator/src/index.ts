import { BackgroundColor, Color, CssColor, Theme } from '@adobe/leonardo-contrast-colors';
import { formatCss, formatHex, oklch } from 'culori';

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_MAIN_BACKGROUND_LIGHTNESS = {
    light: 100,
    dark: 14,
} as const;

const DEFAULT_PRIMITIVE_COLORS = {
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

const DEFAULT_CONTRAST_RATIOS = {
    '050': 1.15,
    '100': 1.3,
    '200': 1.7,
    '300': 2.5,
    '400': 3.0,
    '500': 4.5,
    '600': 6.5,
    '700': 8.5,
    '800': 11.5,
    '900': 15.0,
} as const;

const ADAPTIVE_COLOR_GENERATION = {
    LIGHTNESS_THRESHOLD: 0.5,
    DARK_LIGHTNESS_FACTOR: 0.55,
    LIGHT_LIGHTNESS_FACTOR: 0.85,
    CHROMA_REDUCTION_FACTOR: 0.85,
} as const;

// ============================================================================
// Type Definitions
// ============================================================================

type ThemeType = 'light' | 'dark';

interface OklchColor {
    mode: 'oklch';
    l: number;
    c: number;
    h?: number;
}

interface ColorGeneratorConfig {
    primitiveColors?: Record<string, string>;
    contrastRatios?: Record<string, number>;
    backgroundLightness?: {
        light: number;
        dark: number;
    };
}

// ============================================================================
// Utility Functions
// ============================================================================

const formatOklchForWeb = (oklchString: string): string => {
    // Parse oklch(l c h) format and round to 3 decimal places for web compatibility
    const match = oklchString.match(/oklch\(([^\s]+)\s+([^\s]+)\s+([^\)]+)\)/);
    if (match) {
        const [, l, c, h] = match;
        const roundedL = parseFloat(l).toFixed(3);
        const roundedC = parseFloat(c).toFixed(3);

        // Handle 'none' values and round hue
        let roundedH: string;
        if (h === 'none' || isNaN(parseFloat(h))) {
            roundedH = '0.0';
        } else {
            roundedH = parseFloat(h).toFixed(1);
        }

        return `oklch(${roundedL} ${roundedC} ${roundedH})`;
    }
    return oklchString;
};

// ============================================================================
// Color Generation Logic
// ============================================================================

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

        return {
            lightKey: originalHex as CssColor,
            darkKey: formatHex(darkerKeyOklch) as CssColor,
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

        return {
            lightKey: formatHex(lighterKeyOklch) as CssColor,
            darkKey: originalHex as CssColor,
        };
    }
};

function createVaporColorDefinitions(
    primitiveColors: Record<string, string>,
    contrastRatios: Record<string, number>,
): Color[] {
    return Object.entries(primitiveColors)
        .map(([name, colorHex]) => createColorDefinition({ name, colorHex, contrastRatios }))
        .filter((c): c is Color => c !== null);
}

// ============================================================================
// Theme Generation
// ============================================================================

const createTheme = (themeType: ThemeType, config: ColorGeneratorConfig): Theme => {
    const backgroundLightness = config.backgroundLightness || DEFAULT_MAIN_BACKGROUND_LIGHTNESS;
    const primitiveColors = config.primitiveColors || DEFAULT_PRIMITIVE_COLORS;
    const contrastRatios = config.contrastRatios || DEFAULT_CONTRAST_RATIOS;

    const lightness = backgroundLightness[themeType];
    const colorKey = (themeType === 'light' ? '#FFFFFF' : '#000000') as CssColor;

    const background = new BackgroundColor({
        name: 'gray',
        colorKeys: [colorKey],
        ratios: contrastRatios,
    });

    const vaporColorDefinitions = createVaporColorDefinitions(primitiveColors, contrastRatios);

    return new Theme({
        colors: [...vaporColorDefinitions, background],
        backgroundColor: background,
        lightness,
        output: 'HEX',
    });
};

// ============================================================================
// Color Palette Collection Structure
// ============================================================================

interface ColorToken {
    hex: string;
    oklch: string;
}

interface ThemeTokens {
    background: {
        canvas: ColorToken;
    };
    [colorName: string]: {
        [shade: string]: ColorToken;
    };
}

interface ColorPaletteCollection {
    base: {
        white: ColorToken;
        black: ColorToken;
    };
    light: ThemeTokens;
    dark: ThemeTokens;
}

function generateThemeTokens(themeType: ThemeType, config: ColorGeneratorConfig): ThemeTokens {
    const theme = createTheme(themeType, config);
    const [backgroundObj, ...colors] = theme.contrastColors;

    const result: ThemeTokens = {
        background: {
            canvas: { hex: '', oklch: '' },
        },
    };

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

    colors.forEach((color) => {
        if ('name' in color && 'values' in color) {
            result[color.name] = {};
            color.values.forEach((instance) => {
                const oklchColor = oklch(instance.value);
                const oklchValue = formatCss(oklchColor);

                if (oklchValue) {
                    result[color.name][instance.name] = {
                        hex: instance.value,
                        oklch: formatOklchForWeb(oklchValue),
                    };
                }
            });
        }
    });

    return result;
}

function generateColorPalette(config: ColorGeneratorConfig = {}): ColorPaletteCollection {
    return {
        base: {
            white: {
                hex: '#ffffff',
                oklch: formatOklchForWeb(formatCss(oklch('#ffffff'))!),
            },
            black: {
                hex: '#000000',
                oklch: formatOklchForWeb(formatCss(oklch('#000000'))!),
            },
        },
        light: generateThemeTokens('light', config),
        dark: generateThemeTokens('dark', config),
    };
}

// ============================================================================
// Export
// ============================================================================

export const colorPalette = generateColorPalette();

export {
    generateColorPalette,
    DEFAULT_PRIMITIVE_COLORS,
    DEFAULT_CONTRAST_RATIOS,
    DEFAULT_MAIN_BACKGROUND_LIGHTNESS,
};

export type { ThemeType, ColorToken, ColorPaletteCollection, ColorGeneratorConfig };
