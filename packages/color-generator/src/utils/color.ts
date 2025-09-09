import { formatCss, oklch } from 'culori';

import { BASE_COLORS, BUTTON_FOREGROUND_LIGHTNESS_THRESHOLD } from '../constants';
import type { ColorToken } from '../types';

// ============================================================================
// Color Formatting Utilities
// ============================================================================

/**
 * OKLCH 색상 값을 웹 호환성을 위해 포맷팅합니다.
 * - Lightness, Chroma를 3자리 소수점으로 반올림
 * - Hue를 1자리 소수점으로 반올림
 * - 'none' 값을 '0.0'으로 변환
 */
export const formatOklchForWeb = (oklchString: string): string => {
    const match = oklchString.match(/oklch\(([^\s]+)\s+([^\s]+)\s+([^)]+)\)/);
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
 * 상위 계층 key값 조합으로 codeSyntax를 생성합니다.
 * 최상위 계층(base, light, dark)는 제외하고 생성합니다.
 * @param keyPath - 계층 구조의 key 경로들 (예: ['light', 'blue', '050'])
 * @returns `vapor-color-` prefix를 포함한 codeSyntax
 */
export const generateCodeSyntax = (keyPath: string[]): string => {
    const topLevelKeys = ['base', 'light', 'dark'];
    const filteredPath = keyPath.filter((key) => !topLevelKeys.includes(key));
    return `vapor-color-${filteredPath.join('-')}`;
};

/**
 * 배경 색상의 명도에 따라 적절한 전경 색상을 결정합니다.
 * culori의 oklch() 함수를 사용하여 안전하고 정확하게 lightness 값을 추출합니다.
 * @param backgroundOklch - 배경 색상의 OKLCH 문자열
 * @param threshold - 명도 임계값 (기본값: BUTTON_FOREGROUND_LIGHTNESS_THRESHOLD)
 * @returns 검은색 또는 흰색 ColorToken 객체
 */
export const getContrastingForegroundColor = (
    backgroundOklch: string,
    threshold: number = BUTTON_FOREGROUND_LIGHTNESS_THRESHOLD,
) => {
    const colorObj = oklch(backgroundOklch);
    const lightness = colorObj?.l ?? 0;

    return lightness > threshold ? { ...BASE_COLORS.black } : { ...BASE_COLORS.white };
};

// ============================================================================
// Base Color Token Generation
// ============================================================================

/**
 * Base 컬러 토큰 생성 (흰색, 검은색)
 */
export const createBaseColorTokens = (formatter: (oklchString: string) => string) => {
    return Object.entries(BASE_COLORS).reduce(
        (tokens, [colorName, colorData]) => {
            const oklchColor = oklch(colorData.hex);
            tokens[colorName as keyof typeof BASE_COLORS] = {
                hex: colorData.hex,
                oklch: formatter(formatCss(oklchColor) ?? ''),
                codeSyntax: colorData.codeSyntax,
            };
            return tokens;
        },
        {} as Record<keyof typeof BASE_COLORS, ColorToken>,
    );
};
