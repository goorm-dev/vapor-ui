import type { KeyColor, ThemeOptions } from '@vapor-ui/color-generator';

export interface ColorThemeConfig {
    primary: KeyColor;
    /**
     * 추가 색상, 또는 같은 이름의 기본 색상 대체. `generatePrimitiveColorPalette`의 `basicColors`로 전달됩니다.
     */
    basicColors?: ThemeOptions['basicColors'];
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
