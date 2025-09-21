import { generateBrandColorPalette, getSemanticDependentTokens } from '@vapor-ui/color-generator';

import type { CSSGeneratorOptions, ColorThemeConfig, ThemeVariant } from '../types';
import { type CSSRule, createCSSVariable, formatCSS } from '../utils';

const DEFAULT_PREFIX = 'vapor';

type BrandColorPalette = ReturnType<typeof generateBrandColorPalette>;
type SemanticTokens = ReturnType<typeof getSemanticDependentTokens>;

const DEFAULT_CLASS_NAMES = {
    light: 'vapor-light-theme',
    dark: 'vapor-dark-theme',
} as const;

interface ColorCSSGeneratorContext {
    brandPalette: BrandColorPalette;
    semanticTokens: SemanticTokens;
    options: Required<CSSGeneratorOptions>;
}

const generatePaletteVariables = (
    tokens: Record<
        string,
        string | { hex: string; codeSyntax: string; oklch?: string; name?: string; deltaE?: number }
    >,
    prefix: string,
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
    tokens: Record<
        string,
        string | { hex: string; codeSyntax: string; oklch?: string; name?: string; deltaE?: number }
    >,
    prefix: string,
) => {
    return Object.entries(tokens)
        .filter(([, tokenValue]) => typeof tokenValue === 'string')
        .map(([tokenName, tokenValue]) => {
            const value = tokenValue as string;
            const variableName = `${prefix}-${tokenName}`;
            const valueReference = value.startsWith('color-') ? `var(--${prefix}-${value})` : value;
            return createCSSVariable(variableName, valueReference);
        });
};

const generateRootThemeCSS = (
    context: ColorCSSGeneratorContext,
    variant: ThemeVariant,
): CSSRule => {
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
    colorConfig: ColorThemeConfig,
    options: CSSGeneratorOptions = {},
): string => {
    const resolvedOptions: Required<CSSGeneratorOptions> = {
        classNames: options.classNames || DEFAULT_CLASS_NAMES,
        prefix: options.prefix || DEFAULT_PREFIX,
        format: options.format || 'readable',
    };

    // Convert ColorThemeConfig to the format expected by color-generator functions
    const brandColorConfig = {
        colors: {
            primary: colorConfig.primary.hex,
        },
        background: {
            name: colorConfig.background.name,
            color: colorConfig.background.hex,
            lightness: colorConfig.background.lightness,
        },
    };

    const semanticConfig = {
        primary: {
            name: colorConfig.primary.name,
            hex: colorConfig.primary.hex,
        },
        background: {
            name: colorConfig.background.name,
            color: colorConfig.background.hex,
            lightness: colorConfig.background.lightness,
        },
    };

    // Generate brand palette and semantic tokens internally
    const brandPalette = generateBrandColorPalette(brandColorConfig);
    const semanticTokens = getSemanticDependentTokens(semanticConfig);

    const context: ColorCSSGeneratorContext = {
        brandPalette,
        semanticTokens,
        options: resolvedOptions,
    };

    const lightRule = generateRootThemeCSS(context, 'light');
    const darkRule = generateRootThemeCSS(context, 'dark');

    return formatCSS([lightRule, darkRule], resolvedOptions.format);
};
