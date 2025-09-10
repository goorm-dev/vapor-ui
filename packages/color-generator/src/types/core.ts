type ThemeType = 'light' | 'dark';

interface OklchColor {
    mode: 'oklch';
    l: number;
    c: number;
    h?: number;
}

interface ColorToken {
    name?: string;
    hex: string;
    oklch: string;
    deltaE?: number;
    codeSyntax: string;
}

interface ScaleInfo {
    backgroundScale: string;
    foregroundScale: string;
    alternativeScale: string;
}

interface ThemeTokens {
    background: {
        canvas: ColorToken;
    };
    [colorName: string]: {
        [shade: string]: ColorToken;
    };
}

interface ColorPaletteCollection {
    base: {
        white: ColorToken;
        black: ColorToken;
    };
    light: ThemeTokens;
    dark: ThemeTokens;
}

/* -----------------------------------------------------------------------------------------------*/

export type { ThemeType, OklchColor, ColorToken, ScaleInfo, ThemeTokens, ColorPaletteCollection };
