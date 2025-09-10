/* -------------------------------------------------------------------------------------------------
 * Core Types
 * -----------------------------------------------------------------------------------------------*/

export type ThemeType = 'light' | 'dark';

export interface OklchColor {
    mode: 'oklch';
    l: number;
    c: number;
    h?: number;
}

export interface ColorToken {
    name?: string;
    hex: string;
    oklch: string;
    deltaE?: number;
    codeSyntax: string;
}

export interface ScaleInfo {
    backgroundScale: string;
    foregroundScale: string;
    alternativeScale: string;
}

/* -------------------------------------------------------------------------------------------------
 * Collection & Configuration Types
 * -----------------------------------------------------------------------------------------------*/

export interface ThemeTokens {
    background: {
        canvas: ColorToken;
    };
    [colorName: string]: {
        [shade: string]: ColorToken;
    };
}

export interface ColorPaletteCollection {
    base: {
        white: ColorToken;
        black: ColorToken;
    };
    light: ThemeTokens;
    dark: ThemeTokens;
}

export interface ColorGeneratorConfig {
    colors?: Record<string, string>;
    contrastRatios?: Record<string, number>;
    backgroundLightness?: {
        light: number;
        dark: number;
    };
}
