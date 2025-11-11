/**
 * 디자인 토큰 상수
 *
 * Vapor-UI 디자인 토큰과 Figma 값 간의 매핑 테이블
 */

import type { DimensionToken, RadiusToken, SpaceToken } from '../types';

/**
 * Space Token 매핑 (px → token)
 * PRD 3.2 참조
 */
export const SPACE_TOKEN_MAP: Record<number, SpaceToken> = {
    0: '$000',
    2: '$025',
    4: '$050',
    6: '$075',
    8: '$100',
    12: '$150',
    14: '$175',
    16: '$200',
    18: '$225',
    20: '$250',
    24: '$300',
    32: '$400',
    40: '$500',
    48: '$600',
    56: '$700',
    64: '$800',
    72: '$900',
};

/**
 * Dimension Token 매핑 (px → token)
 */
export const DIMENSION_TOKEN_MAP: Record<number, DimensionToken> = {
    2: '$025',
    4: '$050',
    6: '$075',
    8: '$100',
    12: '$150',
    14: '$175',
    16: '$200',
    18: '$225',
    20: '$250',
    24: '$300',
    32: '$400',
    40: '$500',
    48: '$600',
    56: '$700',
    64: '$800',
};

/**
 * Radius Token 매핑 (px → token)
 */
export const RADIUS_TOKEN_MAP: Record<number, RadiusToken> = {
    0: '$000',
    4: '$050',
    8: '$100',
    16: '$200',
    24: '$300',
    32: '$400',
    40: '$500',
    48: '$600',
    56: '$700',
    64: '$800',
    72: '$900',
};

/**
 * Space Token 정확도 임계값 (px)
 */
export const SPACE_TOKEN_THRESHOLD = 1;

/**
 * 가장 가까운 Space Token 찾기
 */
export function findClosestSpaceToken(value: number): SpaceToken {
    const tokens = Object.keys(SPACE_TOKEN_MAP).map(Number);
    const closest = tokens.reduce((prev, curr) =>
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev,
    );

    return SPACE_TOKEN_MAP[closest];
}

/**
 * 가장 가까운 Dimension Token 찾기
 */
export function findClosestDimensionToken(value: number): DimensionToken | undefined {
    const tokens = Object.keys(DIMENSION_TOKEN_MAP).map(Number);
    const closest = tokens.reduce((prev, curr) =>
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev,
    );

    // 임계값 체크: 너무 멀면 토큰 대신 픽셀값 반환
    if (Math.abs(closest - value) > 2) {
        return undefined;
    }

    return DIMENSION_TOKEN_MAP[closest];
}

/**
 * 가장 가까운 Radius Token 찾기
 */
export function findClosestRadiusToken(value: number): RadiusToken {
    const tokens = Object.keys(RADIUS_TOKEN_MAP).map(Number);
    const closest = tokens.reduce((prev, curr) =>
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev,
    );

    return RADIUS_TOKEN_MAP[closest];
}

/**
 * Color Token 매핑 (RGB → token name)
 *
 * Vapor-UI의 주요 색상 토큰
 * 실제 프로젝트에서는 더 많은 색상 토큰이 필요할 수 있음
 */
export const COLOR_TOKEN_MAP: Record<string, string> = {
    // Primary colors
    '0,87,255': 'primary.500',
    '0,71,209': 'primary.600',
    '0,56,163': 'primary.700',

    // Gray scale
    '255,255,255': 'white',
    '0,0,0': 'black',
    '248,249,250': 'gray.50',
    '241,243,245': 'gray.100',
    '233,236,239': 'gray.200',
    '206,212,218': 'gray.300',
    '173,181,189': 'gray.400',
    '134,142,150': 'gray.500',
    '73,80,87': 'gray.700',
    '33,37,41': 'gray.900',

    // Semantic colors
    '220,53,69': 'danger.500',
    '40,167,69': 'success.500',
    '255,193,7': 'warning.500',
    '13,110,253': 'info.500',
};

/**
 * Typography Token 매핑 (px → token name)
 *
 * fontSize, fontWeight, lineHeight 등의 타이포그래피 토큰
 */
export const TYPOGRAPHY_TOKEN_MAP = {
    fontSize: {
        12: '$xs',
        14: '$sm',
        16: '$md',
        18: '$lg',
        20: '$xl',
        24: '$2xl',
        32: '$3xl',
        40: '$4xl',
    },
    fontWeight: {
        400: '$regular',
        500: '$medium',
        600: '$semibold',
        700: '$bold',
    },
    lineHeight: {
        16: '$xs',
        20: '$sm',
        24: '$md',
        28: '$lg',
        32: '$xl',
    },
};

/**
 * Shadow Token 매핑
 *
 * Figma effects를 Vapor-UI shadow 토큰으로 매핑
 */
export const SHADOW_TOKEN_MAP: Record<string, string> = {
    // Key format: "offsetX,offsetY,blur,spread"
    '0,1,2,0': '$sm',
    '0,2,4,0': '$md',
    '0,4,8,0': '$lg',
    '0,8,16,0': '$xl',
    '0,12,24,0': '$2xl',
};

/**
 * RGB 색상을 문자열 키로 변환
 *
 * @param r - Red (0-1)
 * @param g - Green (0-1)
 * @param b - Blue (0-1)
 * @returns RGB 문자열 키 (예: "255,0,0")
 */
export function rgbToKey(r: number, g: number, b: number): string {
    return `${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)}`;
}

/**
 * RGB 색상을 Color Token으로 매핑
 *
 * @param r - Red (0-1)
 * @param g - Green (0-1)
 * @param b - Blue (0-1)
 * @returns Color token 이름 (없으면 undefined)
 */
export function mapRgbToColorToken(r: number, g: number, b: number): string | undefined {
    const key = rgbToKey(r, g, b);
    return COLOR_TOKEN_MAP[key];
}

/**
 * FontSize를 Typography Token으로 매핑
 *
 * @param fontSize - 픽셀 단위 폰트 크기
 * @returns Typography token (없으면 undefined)
 */
export function mapFontSizeToToken(fontSize: number): string | undefined {
    const rounded = Math.round(fontSize);
    return TYPOGRAPHY_TOKEN_MAP.fontSize[rounded as keyof typeof TYPOGRAPHY_TOKEN_MAP.fontSize];
}

/**
 * FontWeight를 Typography Token으로 매핑
 *
 * @param fontWeight - 폰트 두께
 * @returns Typography token (없으면 undefined)
 */
export function mapFontWeightToToken(fontWeight: number): string | undefined {
    return TYPOGRAPHY_TOKEN_MAP.fontWeight[
        fontWeight as keyof typeof TYPOGRAPHY_TOKEN_MAP.fontWeight
    ];
}

/**
 * LineHeight를 Typography Token으로 매핑
 *
 * @param lineHeight - 픽셀 단위 줄 높이
 * @returns Typography token (없으면 undefined)
 */
export function mapLineHeightToToken(lineHeight: number): string | undefined {
    const rounded = Math.round(lineHeight);
    return TYPOGRAPHY_TOKEN_MAP.lineHeight[
        rounded as keyof typeof TYPOGRAPHY_TOKEN_MAP.lineHeight
    ];
}

/**
 * Shadow effect를 Shadow Token으로 매핑
 *
 * @param offsetX - X 오프셋
 * @param offsetY - Y 오프셋
 * @param blur - 블러 반경
 * @param spread - 확산 반경
 * @returns Shadow token (없으면 undefined)
 */
export function mapShadowToToken(
    offsetX: number,
    offsetY: number,
    blur: number,
    spread: number,
): string | undefined {
    const key = `${Math.round(offsetX)},${Math.round(offsetY)},${Math.round(blur)},${Math.round(spread)}`;
    return SHADOW_TOKEN_MAP[key];
}
