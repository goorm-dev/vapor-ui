import { BackgroundColor, Color, CssColor, Theme } from '@adobe/leonardo-contrast-colors';
import { formatCss, formatHex, oklch } from 'culori';

// ============================================================================
// Configuration (완전 단순화)
// ============================================================================

/**
 * ✨ 완전 단순화: 중첩 객체 제거
 * main만 있으니까 굳이 객체로 감쌀 이유 없음
 */
const MAIN_BACKGROUND_LIGHTNESS = {
    light: 100, // 대비비 계산 기준
    dark: 14, // 대비비 계산 기준
} as const;


// 기존 설정들
const PRIMITIVE_COLORS = {
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
};

const CONTRAST_RATIOS = {
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
};

// ============================================================================
// 타입 정의 (단순화됨)
// ============================================================================

type ThemeType = 'light' | 'dark';

interface OklchColor {
    mode: 'oklch';
    l: number;
    c: number;
    h?: number;
}

// ============================================================================
// 색상 생성 로직 (기존과 동일)
// ============================================================================

const createColorDefinition = ({
    name,
    colorHex,
}: {
    name: string;
    colorHex: string;
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
        ratios: CONTRAST_RATIOS,
    });
};

const vaporColorDefinitions = Object.entries(PRIMITIVE_COLORS)
    .map(([name, colorHex]) => createColorDefinition({ name, colorHex }))
    .filter((c): c is Color => c !== null);

// ============================================================================
// 테마 생성
// ============================================================================

const createTheme = (themeType: ThemeType): Theme => {
    const lightness = MAIN_BACKGROUND_LIGHTNESS[themeType];
    const colorKey = (themeType === 'light' ? '#FFFFFF' : '#000000') as CssColor;

    const background = new BackgroundColor({
        name: 'gray',
        colorKeys: [colorKey],
        ratios: CONTRAST_RATIOS,
    });

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

function generateThemeTokens(themeType: ThemeType): ThemeTokens {
    const theme = createTheme(themeType);
    const [backgroundObj, ...colors] = theme.contrastColors;

    const result: ThemeTokens = {
        background: {
            canvas: { hex: '', oklch: '' }
        }
    };

    // vapor-background-canvas 추가
    if ('background' in backgroundObj) {
        const oklchColor = oklch(backgroundObj.background);
        const oklchValue = formatCss(oklchColor);

        if (oklchValue) {
            result.background.canvas = {
                hex: backgroundObj.background,
                oklch: oklchValue
            };
        }
    }

    // 색상 팔레트들 (gray 포함)
    colors.forEach((color) => {
        if ('name' in color && 'values' in color) {
            result[color.name] = {};
            color.values.forEach((instance) => {
                const oklchColor = oklch(instance.value);
                const oklchValue = formatCss(oklchColor);

                if (oklchValue) {
                    result[color.name][instance.name] = {
                        hex: instance.value,
                        oklch: oklchValue
                    };
                }
            });
        }
    });

    return result;
}

function generateFigmaVariableCollection(): FigmaVariableCollection {
    return {
        base: {
            white: {
                hex: '#ffffff',
                oklch: formatCss(oklch('#ffffff'))!
            },
            black: {
                hex: '#000000',
                oklch: formatCss(oklch('#000000'))!
            }
        },
        light: generateThemeTokens('light'),
        dark: generateThemeTokens('dark')
    };
}

// ============================================================================
// Export
// ============================================================================

export const figmaVariables = generateFigmaVariableCollection();

export type { ThemeType, ColorToken, FigmaVariableCollection };
