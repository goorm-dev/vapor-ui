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

// `--{prefix}-color-canvas` predates the gray palette; keep the name, value it from gray.
const CANVAS_GRAY_SCALE: Record<ThemeVariant, string> = { light: '000', dark: '025' };

const generatePaletteVariables = (
    modeTokens: ThemeResult['lightModeTokens'],
    variant: ThemeVariant,
    prefix: string,
) => {
    const variables: ReturnType<typeof createCSSVariable>[] = [];

    const gray = modeTokens.palettes.find((palette) => palette.name === 'gray');
    const canvas = gray?.chips[CANVAS_GRAY_SCALE[variant]];
    if (canvas) variables.push(createCSSVariable(`${prefix}-color-canvas`, canvas.hex));

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
        ...generatePaletteVariables(modeTokens, variant, prefix),
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
        basicColors: colorConfig.basicColors,
        brandColor: {
            name: colorConfig.primary.name,
            hexcode: colorConfig.primary.hexcode,
        },
    });

    const semanticTokens = getSemanticDependentTokens(themeResult, colorConfig.primary.name);

    const context: ColorCSSGeneratorContext = {
        themeResult,
        semanticTokens,
        options: resolvedOptions,
    };

    const lightRule = generateRootThemeCSS(context, 'light');
    const darkRule = generateRootThemeCSS(context, 'dark');

    return formatCSS([lightRule, darkRule], resolvedOptions.format);
};
