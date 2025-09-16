export interface ColorThemeConfig {
    primary: {
        name: string;
        hex: string;
    };
    background: {
        name: string;
        hex: string;
        lightness: {
            light: number;
            dark: number;
        };
    };
}

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
