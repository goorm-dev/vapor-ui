import { formatCss, oklch } from 'culori';

import { DEFAULT_CONTRAST_RATIOS, DEFAULT_PRIMITIVE_COLORS, BASE_COLORS } from '../constants';
import { generateThemeTokens } from '../libs';
import type { ColorGeneratorConfig, ColorPaletteCollection, ColorToken } from '../types';
import { formatOklchForWeb } from '../utils';

const createBaseColorTokens = (formatter: (oklchString: string) => string) => {
    return Object.entries(BASE_COLORS).reduce(
        (tokens, [colorName, colorData]) => {
            const oklchColor = oklch(colorData.hex);
            tokens[colorName as keyof typeof BASE_COLORS] = {
                hex: colorData.hex,
                oklch: formatter(formatCss(oklchColor) ?? ''),
                codeSyntax: colorData.codeSyntax,
            };
            return tokens;
        },
        {} as Record<keyof typeof BASE_COLORS, ColorToken>,
    );
};

function generateSystemColorPalette(
    config: ColorGeneratorConfig = {},
): ColorPaletteCollection {
    const colors = config.colors || DEFAULT_PRIMITIVE_COLORS;
    const contrastRatios = config.contrastRatios || DEFAULT_CONTRAST_RATIOS;

    return {
        base: createBaseColorTokens(formatOklchForWeb),
        light: generateThemeTokens(colors, contrastRatios, 'light'),
        dark: generateThemeTokens(colors, contrastRatios, 'dark'),
    };
}

/* -----------------------------------------------------------------------------------------------*/

export { generateSystemColorPalette };