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
