import type { BASE_BASIC_COLORS, LIGHT_BASIC_COLORS } from './basic-color';

/**
 * LIGHT_BASIC_COLORS의 전체 구조를 나타내는 타입
 * 색상 팔레트의 모든 색상(red, blue, gray 등)과 그 shade들을 포함
 */
export type BasicColorPalette = typeof LIGHT_BASIC_COLORS;

/**
 * 색상 이름 타입 (background, black, white 제외)
 * 예: 'red' | 'blue' | 'green' | 'gray' | ...
 */
export type ColorName = Exclude<keyof BasicColorPalette, 'background' | 'black' | 'white'>;

/**
 * 색상 단계(shade) 타입
 * 예: '050' | '100' | '200' | ... | '900'
 */
export type ColorShade = keyof BasicColorPalette['blue'];

/**
 * 기본 색상 이름 타입 (black, white)
 */
export type BaseColorName = keyof typeof BASE_BASIC_COLORS;

/**
 * 배경 색상 키 타입
 * 예: 'canvas'
 */
export type BackgroundKey = keyof BasicColorPalette['background'];
