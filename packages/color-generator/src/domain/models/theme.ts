import type { BackgroundColor, ContrastRatios, KeyColor } from './color';

/**
 * 테마 생성 옵션
 */
export interface ThemeOptions {
    /** 시스템 기본 키 컬러 (11개) */
    keyColors?: Record<string, string>;
    /** 추가 브랜드 컬러 */
    brandColor?: KeyColor;
    /** 기준 배경색 (Light/Dark 모드별 lightness 값 포함) */
    backgroundColor?: BackgroundColor;
    /** 명암비 설정 */
    contrastRatios?: ContrastRatios;
}

/**
 * 시맨틱 토큰 매핑 결과
 */
export interface SemanticTokens {
    'color-background-primary-100': string;
    'color-background-primary-200': string;
    'color-border-primary': string;
    'color-foreground-100': string;
    'color-foreground-200': string;
    'color-background-canvas-100': string;
    'color-background-canvas-200': string;
    'color-background-overlay-100': string;
}

/**
 * 시맨틱 토큰 결과 (Light/Dark)
 */
export interface SemanticResult {
    lightModeTokens: SemanticTokens;
    darkModeTokens: SemanticTokens;
}
