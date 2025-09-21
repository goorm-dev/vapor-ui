import type { SemanticMappingConfig } from '@vapor-ui/color-generator';

import type { RadiusKey } from '../generators/radius';

export type ColorThemeConfig = SemanticMappingConfig;

export interface CompleteCSSConfig {
    colors: ColorThemeConfig;
    scaling: number;
    radius: RadiusKey;
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
