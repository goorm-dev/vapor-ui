import { oklch } from 'culori';

import { BASE_COLORS, BUTTON_FOREGROUND_LIGHTNESS_THRESHOLD } from '../constants';

/* -------------------------------------------------------------------------------------------------
 * Color Formatting Utilities
 * -----------------------------------------------------------------------------------------------*/

/**
 * OKLCH 색상 값을 웹 호환성을 위해 포맷팅합니다.
 * - Lightness, Chroma를 3자리 소수점으로 반올림
 * - Hue를 1자리 소수점으로 반올림
 * - 'none' 값을 '0.0'으로 변환
 *
 * @param oklchString - 원본 OKLCH 문자열
 * @returns 포맷팅된 OKLCH 문자열
 *
 * @example
 * formatOklchForWeb('oklch(0.7121111 0.15199999 180)')
 * // returns: 'oklch(0.712 0.152 180.0)'
 */
const formatOklchForWeb = (oklchString: string): string => {
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
 * 상위 계층 key값 조합으로 CSS 변수 이름을 생성합니다.
 * 최상위 계층(base, light, dark)는 제외하고 생성합니다.
 *
 * @param keyPath - 계층 구조의 key 경로들
 * @returns `vapor-color-` prefix를 포함한 CSS 변수명
 *
 * @example
 * generateCodeSyntax(['light', 'blue', '050'])
 * // returns: 'vapor-color-blue-050'
 *
 * generateCodeSyntax(['background', 'canvas'])
 * // returns: 'vapor-color-background-canvas'
 */
const generateCodeSyntax = (keyPath: string[]): string => {
    const topLevelKeys = ['base', 'light', 'dark'];
    const filteredPath = keyPath.filter((key) => !topLevelKeys.includes(key));
    return `vapor-color-${filteredPath.join('-')}`;
};

/**
 * 배경 색상의 명도에 따라 적절한 전경 색상(흑/백)을 결정합니다.
 *
 * @param backgroundOklch - 배경 색상의 OKLCH 문자열
 * @param threshold - 명도 임계값 (기본값: 0.65)
 * @returns 검은색 또는 흰색 ColorToken 객체
 *
 * @example
 * getContrastingForegroundColor('oklch(0.8 0.1 180)')
 * // returns: { name: 'color-black', hex: '#000000', ... }
 *
 * getContrastingForegroundColor('oklch(0.3 0.1 180)')
 * // returns: { name: 'color-white', hex: '#FFFFFF', ... }
 */
const getContrastingForegroundColor = (
    backgroundOklch: string,
    threshold: number = BUTTON_FOREGROUND_LIGHTNESS_THRESHOLD,
) => {
    const colorObj = oklch(backgroundOklch);
    const lightness = colorObj?.l ?? 0;

    return lightness > threshold ? { ...BASE_COLORS.black } : { ...BASE_COLORS.white };
};

/* -------------------------------------------------------------------------------------------------
 * Palette Scale Utilities
 * -----------------------------------------------------------------------------------------------*/

/**
 * 팔레트의 스케일 키를 숫자 순서로 정렬합니다.
 *
 * @param palette - 색상 팔레트 객체
 * @returns 정렬된 스케일 키 배열
 *
 * @example
 * getSortedScales({ '100': {...}, '050': {...}, '200': {...} })
 * // returns: ['050', '100', '200']
 */
function getSortedScales(palette: Record<string, unknown>): string[] {
    return Object.keys(palette).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
}

/**
 * deltaE 값이 가장 낮은(원본 색상과 가장 유사한) 스케일을 찾습니다.
 *
 * @param palette - deltaE 정보를 포함한 색상 팔레트
 * @returns 가장 가까운 스케일 키 또는 null
 *
 * @example
 * findClosestScale({ '100': { deltaE: 5.2 }, '200': { deltaE: 1.1 }, '300': { deltaE: 8.7 } })
 * // returns: '200'
 */
function findClosestScale(palette: Record<string, { deltaE?: number }>): string | null {
    const scaleKeys = Object.keys(palette);
    if (scaleKeys.length === 0) return null;

    return scaleKeys.reduce((closestKey, currentKey) => {
        const closestDeltaE = palette[closestKey]?.deltaE ?? Infinity;
        const currentDeltaE = palette[currentKey]?.deltaE ?? Infinity;
        return currentDeltaE < closestDeltaE ? currentKey : closestKey;
    });
}


/* -----------------------------------------------------------------------------------------------*/

export {
    formatOklchForWeb,
    generateCodeSyntax,
    getContrastingForegroundColor,
    getSortedScales,
    findClosestScale,
};

export const Color = {
    formatOklchForWeb,
    generateCodeSyntax,
    getContrastingForegroundColor,
    getSortedScales,
    findClosestScale,
};
