import { generateBrandColorPalette, getSemanticDependentTokens } from '@vapor-ui/color-generator';
import type { ColorToken, Tokens } from '@vapor-ui/color-generator';

import { DEFAULT_PREFIX } from '~/constants';

import type { CSSGeneratorOptions, ColorThemeConfig, ThemeVariant } from '../types';
import { type CSSRule, createCSSVariable, formatCSS } from '../utils';

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

const isColorToken = (value: string | ColorToken): value is ColorToken => {
    return typeof value === 'object' && 'hex' in value && 'codeSyntax' in value;
};

const generatePaletteVariables = (
    tokens: Tokens,
    prefix: string,
) => {
    return Object.entries(tokens)
        .filter(([, tokenData]) => isColorToken(tokenData))
        .map(([, tokenData]) => {
            const token = tokenData as ColorToken;
            const variableName = token.codeSyntax.replace('vapor-', `${prefix}-`);
            return createCSSVariable(variableName, token.hex);
        });
};

const generateSemanticVariables = (
    tokens: Tokens,
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
        classNames: DEFAULT_CLASS_NAMES,
        prefix: DEFAULT_PREFIX,
        format: 'readable',
        ...options,
    };

    const brandPalette = generateBrandColorPalette({
        colors: {
            [colorConfig.primary.name]: colorConfig.primary.color,
        },
        background: colorConfig.background,
    });

    const semanticTokens = getSemanticDependentTokens(colorConfig);

    const context: ColorCSSGeneratorContext = {
        brandPalette,
        semanticTokens,
        options: resolvedOptions,
    };

    const lightRule = generateRootThemeCSS(context, 'light');
    const darkRule = generateRootThemeCSS(context, 'dark');

    return formatCSS([lightRule, darkRule], resolvedOptions.format);
};
