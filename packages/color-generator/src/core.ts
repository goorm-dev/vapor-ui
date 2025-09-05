import { formatCss, oklch } from 'culori';

// ============================================================================
// Domain Constants
// ============================================================================

export const DEFAULT_MAIN_BACKGROUND_LIGHTNESS = {
    light: 100,
    dark: 14,
} as const;

export const DEFAULT_CONTRAST_RATIOS = {
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

// 시맨틱 토큰 카테고리와 변형 정의
export const SEMANTIC_TOKEN_BASE_PATTERNS = {
    Background: 'background',
    Foreground: 'foreground',
    Border: 'border',
    ButtonForeground: 'button-foreground',
} as const;

export const SEMANTIC_TOKEN_VARIANTS = {
    Default: '', // 기본 변형 (background, border, button-foreground)
    Variant100: '100',
    Variant200: '200',
} as const;

// 색상별 시맨틱 토큰 생성 함수 (패턴: {category}-{color}[-{variant}])
export const createSemanticTokenKeys = <T extends string>(colorName: T) => {
    return {
        Background: `background-${colorName}` as const,
        Foreground100: `foreground-${colorName}-100` as const,
        Foreground200: `foreground-${colorName}-200` as const,
        Border: `border-${colorName}` as const,
        ButtonForeground: `button-foreground-${colorName}` as const,
    };
};

// 각 색상별 토큰 키 정의
export const PRIMARY_TOKEN_KEYS = createSemanticTokenKeys('primary');
export const SECONDARY_TOKEN_KEYS = createSemanticTokenKeys('secondary');
export const SUCCESS_TOKEN_KEYS = createSemanticTokenKeys('success');
export const WARNING_TOKEN_KEYS = createSemanticTokenKeys('warning');
export const ERROR_TOKEN_KEYS = createSemanticTokenKeys('error');

// ============================================================================
// Domain Types
// ============================================================================

export type ThemeType = 'light' | 'dark';

export interface ColorToken {
    hex: string;
    oklch: string;
    deltaE?: number;
}

// 일반적인 시맨틱 토큰 맵 타입
export type SemanticDependentTokens<T extends string> = Record<
    ReturnType<typeof createSemanticTokenKeys<T>>[keyof ReturnType<
        typeof createSemanticTokenKeys<T>
    >],
    string
>;

// 각 색상별 토큰 맵 타입
export type PrimaryDependentTokenMap = SemanticDependentTokens<'primary'>;
export type SecondaryDependentTokenMap = SemanticDependentTokens<'secondary'>;
export type SuccessDependentTokenMap = SemanticDependentTokens<'success'>;
export type WarningDependentTokenMap = SemanticDependentTokens<'warning'>;
export type ErrorDependentTokenMap = SemanticDependentTokens<'error'>;

export interface SemanticTokenMap {
    primary: PrimaryDependentTokenMap;
    secondary?: SecondaryDependentTokenMap;
    success?: SuccessDependentTokenMap;
    warning?: WarningDependentTokenMap;
    error?: ErrorDependentTokenMap;
}

export type SemanticColorName = keyof SemanticTokenMap;

export interface ThemeDependentTokensCollection {
    light: SemanticTokenMap;
    dark: SemanticTokenMap;
}

export interface ThemeTokens {
    background: {
        canvas: ColorToken;
    };
    [colorName: string]: {
        [shade: string]: ColorToken;
    };
}

export interface ColorPaletteCollection {
    base: {
        white: ColorToken;
        black: ColorToken;
    };
    light: ThemeTokens;
    dark: ThemeTokens;
}

export interface ColorGeneratorConfig {
    colors?: Record<string, string>;
    contrastRatios?: Record<string, number>;
    backgroundLightness?: {
        light: number;
        dark: number;
    };
}

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

// ============================================================================
// Domain Utilities
// ============================================================================

/**
 * OKLCH 색상 값을 웹 호환성을 위해 포맷팅합니다.
 * - Lightness, Chroma를 3자리 소수점으로 반올림
 * - Hue를 1자리 소수점으로 반올림
 * - 'none' 값을 '0.0'으로 변환
 */
export const formatOklchForWeb = (oklchString: string): string => {
    const match = oklchString.match(/oklch\(([^\s]+)\s+([^\s]+)\s+([^\)]+)\)/);
    if (match) {
        const [, l, c, h] = match;
        const roundedL = parseFloat(l).toFixed(3);
        const roundedC = parseFloat(c).toFixed(3);

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

/**
 * Base 컬러 토큰 생성 (흰색, 검은색)
 */
const BASE_COLORS = {
    white: '#ffffff',
    black: '#000000',
} as const;

export const createBaseColorTokens = (formatter: (oklchString: string) => string) => {
    return Object.entries(BASE_COLORS).reduce(
        (tokens, [colorName, hexValue]) => {
            const oklchColor = oklch(hexValue);
            tokens[colorName as keyof typeof BASE_COLORS] = {
                hex: hexValue,
                oklch: formatter(formatCss(oklchColor) ?? ''),
            };
            return tokens;
        },
        {} as Record<keyof typeof BASE_COLORS, ColorToken>,
    );
};
