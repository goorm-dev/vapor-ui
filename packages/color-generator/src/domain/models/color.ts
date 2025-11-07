/**
 * 기본 색상 타입 정의
 */
export type Hexcode = string;

/**
 * 키 컬러 정보
 */
export interface KeyColor {
    name: string;
    hexcode: Hexcode;
}

/**
 * 배경색 정보
 */
export interface BackgroundColor extends KeyColor {}

/**
 * 명암비 설정 객체 타입
 */
export type ContrastRatios = Record<string, number>;

/**
 * OKLCH 색상 정보
 */
export interface OklchColor {
    mode: 'oklch';
    l: number;
    c: number;
    h?: number;
}
