import type { BackgroundColor, KeyColor } from '@vapor-ui/color-generator';

export interface ColorThemeConfig {
    primary: KeyColor;
    background: BackgroundColor;
    /**
     * 시스템 기본 키 컬러 (11개)
     * 생략 시 DEFAULT_KEY_COLORS가 사용됩니다.
     */
    keyColors?: Record<string, string>;
}

export interface CompleteCSSConfig {
    colors: ColorThemeConfig;
    scaling: number;
    radius: RadiusKey;
}

export interface CSSGeneratorOptions {
    prefix?: string;
    format?: 'compact' | 'readable';
}

export type RadiusKey = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

export type ThemeVariant = 'light' | 'dark';
