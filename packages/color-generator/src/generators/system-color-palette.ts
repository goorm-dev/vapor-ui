import { formatCss, oklch } from 'culori';

import {
    BASE_COLORS,
    DEFAULT_CONTRAST_RATIOS,
    DEFAULT_KEY_COLORS,
    DEFAULT_MAIN_BACKGROUND_LIGHTNESS,
} from '../constants';
import { generateThemeTokens } from '../libs';
import type { ColorGeneratorConfig, ColorPaletteResult, ColorToken } from '../types';
import { formatOklchForWeb } from '../utils';

const createBaseColorTokens = (formatter: (oklchString: string) => string) => {
    return Object.entries(BASE_COLORS).reduce(
        (tokens, [colorName, colorData]) => {
            const oklchColor = oklch(colorData.hex);
            tokens[colorName as keyof typeof BASE_COLORS] = {
                name: colorData.name,
                hex: colorData.hex,
                oklch: formatter(formatCss(oklchColor) ?? ''),
                codeSyntax: colorData.codeSyntax,
            };
            return tokens;
        },
        {} as Record<keyof typeof BASE_COLORS, ColorToken>,
    );
};

/**
 * 시스템 컬러 팔레트를 생성합니다.
 * Primitive 토큰들을 포함한 일관된 토큰 컨테이너 형태로 반환합니다.
 *
 * @param config - 색상 생성기 설정
 * @returns 기본, 라이트, 다크 테마의 토큰 컨테이너
 *
 * @example
 * generateSystemColorPalette()
 * // returns: {
 * //   base: { tokens: { "color-white": {...}, "color-black": {...} }, metadata: {...} },
 * //   light: { tokens: { "color-blue-050": {...}, "color-background-canvas": {...} }, metadata: {...} },
 * //   dark: { tokens: { ... }, metadata: {...} }
 * // }
 */
function generateSystemColorPalette(config: ColorGeneratorConfig = {}): ColorPaletteResult {
    const colors = config.colors || DEFAULT_KEY_COLORS;
    const contrastRatios = config.contrastRatios || DEFAULT_CONTRAST_RATIOS;
    const background = config.background || {
        color: '#FFFFFF',
        lightness: DEFAULT_MAIN_BACKGROUND_LIGHTNESS,
        name: 'gray',
    };

    const lightTokens = generateThemeTokens({
        colors,
        contrastRatios,
        backgroundColor: background.color,
        backgroundName: background.name,
        lightness: background.lightness.light,
    });

    const darkTokens = generateThemeTokens({
        colors,
        contrastRatios,
        backgroundColor: background.color,
        backgroundName: background.name,
        lightness: background.lightness.dark,
    });

    const lightContainer: ColorPaletteResult['light'] = {
        tokens: lightTokens,
        metadata: {
            type: 'primitive',
            theme: 'light',
        },
    };

    const darkContainer: ColorPaletteResult['dark'] = {
        tokens: darkTokens,
        metadata: {
            type: 'primitive',
            theme: 'dark',
        },
    };

    const baseTokens = createBaseColorTokens(formatOklchForWeb);

    // Create base token container
    const baseContainer = {
        tokens: Object.entries(baseTokens).reduce(
            (acc, [, token]) => {
                acc[token.name!] = token;
                return acc;
            },
            {} as Record<string, ColorToken>,
        ),
        metadata: {
            type: 'primitive' as const,
            theme: 'base' as const,
        },
    };

    return {
        base: baseContainer,
        light: lightContainer,
        dark: darkContainer,
    };
}

/* -----------------------------------------------------------------------------------------------*/

export { generateSystemColorPalette };
