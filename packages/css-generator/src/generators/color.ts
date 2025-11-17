import {
    generatePrimitiveColorPalette,
    getSemanticDependentTokens,
} from '@vapor-ui/color-generator';
import type { SemanticResult, ThemeResult } from '@vapor-ui/color-generator';

import { DEFAULT_PREFIX } from '~/constants';

import type { CSSGeneratorOptions, ColorThemeConfig, ThemeVariant } from '../types';
import { type CSSRule, createCSSVariable, formatCSS } from '../utils';

interface ColorCSSGeneratorContext {
    themeResult: ThemeResult;
    semanticTokens: SemanticResult;
    options: Required<CSSGeneratorOptions>;
}

const generatePaletteVariables = (
    modeTokens: ThemeResult['lightModeTokens'],
    prefix: string,
) => {
    const variables: ReturnType<typeof createCSSVariable>[] = [];

    // Generate backgroundCanvas token first
    const bgCanvas = modeTokens.backgroundCanvas;
    const bgVariableName = bgCanvas.codeSyntax.replace('vapor-', `${prefix}-`);
    variables.push(createCSSVariable(bgVariableName, bgCanvas.hex));

    // Generate palette tokens
    modeTokens.palettes.forEach((palette) => {
        Object.values(palette.chips).forEach((chip) => {
            const variableName = chip.codeSyntax.replace('vapor-', `${prefix}-`);
            variables.push(createCSSVariable(variableName, chip.hex));
        });
    });

    return variables;
};

const generateSemanticVariables = (
    semanticTokens: SemanticResult['lightModeTokens'],
    prefix: string,
) => {
    return Object.entries(semanticTokens).map(([tokenName, tokenValue]) => {
        const variableName = `${prefix}-${tokenName}`;
        const valueReference = tokenValue.startsWith('color-')
            ? `var(--${prefix}-${tokenValue})`
            : tokenValue;
        return createCSSVariable(variableName, valueReference);
    });
};

const generateRootThemeCSS = (
    context: ColorCSSGeneratorContext,
    variant: ThemeVariant,
): CSSRule => {
    const { themeResult, semanticTokens, options } = context;
    const { prefix } = options;

    const modeTokens =
        variant === 'light' ? themeResult.lightModeTokens : themeResult.darkModeTokens;

    const semanticModeTokens =
        variant === 'light' ? semanticTokens.lightModeTokens : semanticTokens.darkModeTokens;

    const properties = [
        ...generatePaletteVariables(modeTokens, prefix),
        ...generateSemanticVariables(semanticModeTokens, prefix),
    ];

    const selector =
        variant === 'light' ? ':root, [data-vapor-theme="light"]' : '[data-vapor-theme="dark"]';

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
        prefix: DEFAULT_PREFIX,
        format: 'readable',
        ...options,
    };

    const themeResult = generatePrimitiveColorPalette({
        brandColor: {
            name: colorConfig.primary.name,
            hexcode: colorConfig.primary.hexcode,
        },
        backgroundColor: {
            name: colorConfig.background.name,
            hexcode: colorConfig.background.hexcode,
            lightness: colorConfig.background.lightness,
        },
    });

    const semanticTokens = getSemanticDependentTokens(
        themeResult,
        colorConfig.primary.name,
        colorConfig.background.name,
    );

    const context: ColorCSSGeneratorContext = {
        themeResult,
        semanticTokens,
        options: resolvedOptions,
    };

    const lightRule = generateRootThemeCSS(context, 'light');
    const darkRule = generateRootThemeCSS(context, 'dark');

    return formatCSS([lightRule, darkRule], resolvedOptions.format);
};
