import { formatCss, oklch } from 'culori';

// ============================================================================
// Color Generator Core Types & Utilities
// ============================================================================

// ============================================================================
// Domain Types
// ============================================================================

export type ThemeType = 'light' | 'dark';

export interface OklchColor {
    mode: 'oklch';
    l: number;
    c: number;
    h?: number;
}

export interface ColorToken {
    hex: string;
    oklch: string;
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
    primitiveColors?: Record<string, string>;
    contrastRatios?: Record<string, number>;
    backgroundLightness?: {
        light: number;
        dark: number;
    };
}

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
export const createBaseColorTokens = (formatter: (oklchString: string) => string) => {
    return {
        white: {
            hex: '#ffffff',
            oklch: formatter(formatCss(oklch('#ffffff'))!),
        },
        black: {
            hex: '#000000',
            oklch: formatter(formatCss(oklch('#000000'))!),
        },
    };
};
