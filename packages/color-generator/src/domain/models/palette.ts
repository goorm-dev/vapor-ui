import type { Hexcode } from './color';

/**
 * 팔레트 칩 - 각 색상 단계별 정보를 포함
 */
export interface PaletteChip {
    name: string;
    hex: Hexcode;
    oklch: string;
    deltaE: number;
    codeSyntax: string;
}

/**
 * Primitive 팔레트 - 단일 컬러의 모든 단계
 */
export interface PrimitivePalette {
    name: string;
    chips: Record<string, PaletteChip>; // '050', '100', ..., '900'
}

/**
 * 배경 캔버스 정보
 */
export interface BackgroundCanvas {
    name: string;
    hex: Hexcode;
    oklch: string;
    codeSyntax: string;
}

/**
 * Primitive Color Palette 생성 결과
 */
export interface PrimitiveColorTokens {
    /** 팔레트 배열 (red, blue, gray, brand 등) */
    palettes: PrimitivePalette[];
    /** 기준 배경 캔버스 */
    backgroundCanvas: BackgroundCanvas;
}

/**
 * 테마별 결과 (Light/Dark)
 */
export interface ThemeResult {
    lightModeTokens: PrimitiveColorTokens;
    darkModeTokens: PrimitiveColorTokens;
    baseTokens: Record<string, PaletteChip>; // color-white, color-black
}
