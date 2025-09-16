type ThemeType = 'light' | 'dark' | 'base';

type TokenType = 'primitive' | 'semantic' | 'component-specific';

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

interface Tokens {
    [tokenName: string]: ColorToken | string;
}

interface ScaleInfo {
    backgroundScale: string;
    foregroundScale: string;
    alternativeScale: string;
}

interface TokenContainer {
    tokens: Tokens;
    metadata: {
        type: TokenType;
        theme: ThemeType;
    };
}

interface ColorPaletteResult {
    base?: TokenContainer;
    light: TokenContainer;
    dark: TokenContainer;
}

interface SemanticTokensResult {
    semantic: {
        light: TokenContainer;
        dark: TokenContainer;
    };
    componentSpecific: {
        light: TokenContainer;
        dark: TokenContainer;
    };
}

/* -----------------------------------------------------------------------------------------------*/

export type {
    ThemeType,
    TokenType,
    OklchColor,
    ColorToken,
    Tokens,
    ScaleInfo,
    TokenContainer,
    ColorPaletteResult,
    SemanticTokensResult,
};
