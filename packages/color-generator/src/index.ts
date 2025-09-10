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
    red: '#DF3337',
    pink: '#DA2F74',
    grape: '#BE2CE2',
    violet: '#8754F9',
    blue: '#2A6FF3',
    cyan: '#0E81A0',
    green: '#0A8672',
    lime: '#8FD327',
    yellow: '#FABB00',
    orange: '#D14905',
} as const;

const DEFAULT_CONTRAST_RATIOS = {
    '50': 1.15,
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

    const adaptiveL = brandColorOklch.l * Math.max(0.35, 0.25);
    const adaptiveC = brandColorOklch.c * 0.85;

    const darkerKeyOklch: OklchColor = {
        ...brandColorOklch,
        mode: 'oklch',
        l: adaptiveL,
        c: adaptiveC,
    };

    return new Color({
        name,
        colorKeys: [colorHex as CssColor, formatHex(darkerKeyOklch) as CssColor],
        colorspace: 'OKLCH',
        ratios: contrastRatios,
    });
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
// Figma Variable Collection Structure
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

interface FigmaVariableCollection {
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
                oklch: oklchValue,
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
                        oklch: oklchValue,
                    };
                }
            });
        }
    });

    return result;
}

function generateFigmaVariableCollection(
    config: ColorGeneratorConfig = {},
): FigmaVariableCollection {
    return {
        base: {
            white: {
                hex: '#ffffff',
                oklch: formatCss(oklch('#ffffff'))!,
            },
            black: {
                hex: '#000000',
                oklch: formatCss(oklch('#000000'))!,
            },
        },
        light: generateThemeTokens('light', config),
        dark: generateThemeTokens('dark', config),
    };
}

// ============================================================================
// Export
// ============================================================================

export const figmaVariables = generateFigmaVariableCollection();

export {
    generateFigmaVariableCollection,
    DEFAULT_PRIMITIVE_COLORS,
    DEFAULT_CONTRAST_RATIOS,
    DEFAULT_MAIN_BACKGROUND_LIGHTNESS,
};

export type { ThemeType, ColorToken, FigmaVariableCollection, ColorGeneratorConfig };
