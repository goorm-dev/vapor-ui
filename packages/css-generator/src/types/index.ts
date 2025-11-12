import type { BackgroundColor, KeyColor } from '@vapor-ui/color-generator';

export interface ColorThemeConfig {
    primary: KeyColor;
    background: BackgroundColor;
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
