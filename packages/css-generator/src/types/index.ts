import type { SemanticMappingConfig } from '@vapor-ui/color-generator';

export type ColorThemeConfig = SemanticMappingConfig;

export interface CompleteCSSConfig {
    colors: ColorThemeConfig;
    scaling: number;
    radius: number;
}

export interface ThemeClassNames {
    light: string;
    dark: string;
}

export interface CSSGeneratorOptions {
    classNames?: ThemeClassNames;
    prefix?: string;
    format?: 'compact' | 'readable';
}

export type ThemeVariant = 'light' | 'dark';
