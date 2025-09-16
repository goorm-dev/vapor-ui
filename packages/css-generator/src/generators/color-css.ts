import type { 
    generateBrandColorPalette, 
    getSemanticDependentTokens 
} from '@vapor-ui/color-generator';

import type { 
    CSSGeneratorOptions,
    ThemeVariant 
} from '../types';
import { formatCSS, createCSSVariable, type CSSRule } from '../utils';

type BrandColorPalette = ReturnType<typeof generateBrandColorPalette>;
type SemanticTokens = ReturnType<typeof getSemanticDependentTokens>;

const DEFAULT_CLASS_NAMES = {
    light: 'vapor-light-theme',
    dark: 'vapor-dark-theme',
} as const;

const DEFAULT_PREFIX = 'vapor';

interface ColorCSSGeneratorContext {
    brandPalette: BrandColorPalette;
    semanticTokens: SemanticTokens;
    options: Required<CSSGeneratorOptions>;
}

const generatePaletteVariables = (
    tokens: Record<string, string | { hex: string; codeSyntax: string; oklch?: string; name?: string; deltaE?: number }>,
    prefix: string
) => {
    return Object.entries(tokens)
        .filter(([, tokenData]) => typeof tokenData === 'object')
        .map(([, tokenData]) => {
            const token = tokenData as { hex: string; codeSyntax: string };
            const variableName = token.codeSyntax.replace('vapor-', `${prefix}-`);
            return createCSSVariable(variableName, token.hex);
        });
};

const generateSemanticVariables = (
    tokens: Record<string, string | { hex: string; codeSyntax: string; oklch?: string; name?: string; deltaE?: number }>,
    prefix: string
) => {
    return Object.entries(tokens)
        .filter(([, tokenValue]) => typeof tokenValue === 'string')
        .map(([tokenName, tokenValue]) => {
            const value = tokenValue as string;
            const variableName = `${prefix}-${tokenName}`;
            const valueReference = value.startsWith('color-') 
                ? `var(--${prefix}-${value})`
                : value;
            return createCSSVariable(variableName, valueReference);
        });
};

const generateRootThemeCSS = (context: ColorCSSGeneratorContext, variant: ThemeVariant): CSSRule => {
    const { brandPalette, semanticTokens, options } = context;
    const { prefix } = options;
    
    const paletteTokens = brandPalette[variant]?.tokens || {};
    const semanticData = semanticTokens.semantic[variant]?.tokens || {};
    const componentData = semanticTokens.componentSpecific[variant]?.tokens || {};
    
    const properties = [
        ...generatePaletteVariables(paletteTokens, prefix),
        ...generateSemanticVariables(semanticData, prefix),
        ...generateSemanticVariables(componentData, prefix),
    ];
    
    const selector = variant === 'light' ? ':root' : `:root.${options.classNames[variant]}`;
    
    return {
        selector,
        properties,
    };
};

export const generateColorCSS = (
    brandPalette: BrandColorPalette,
    semanticTokens: SemanticTokens,
    options: CSSGeneratorOptions = {}
): string => {
    const resolvedOptions: Required<CSSGeneratorOptions> = {
        classNames: options.classNames || DEFAULT_CLASS_NAMES,
        prefix: options.prefix || DEFAULT_PREFIX,
        format: options.format || 'readable',
    };
    
    const context: ColorCSSGeneratorContext = {
        brandPalette,
        semanticTokens,
        options: resolvedOptions,
    };
    
    const lightRule = generateRootThemeCSS(context, 'light');
    const darkRule = generateRootThemeCSS(context, 'dark');
    
    return formatCSS([lightRule, darkRule], resolvedOptions.format);
};