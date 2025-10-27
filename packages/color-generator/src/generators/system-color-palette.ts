import { formatCss, oklch } from 'culori';

import {
    BASE_COLORS,
    DEFAULT_CONTRAST_RATIOS,
    DEFAULT_MAIN_BACKGROUND_LIGHTNESS,
    DEFAULT_PRIMITIVE_COLORS,
} from '../constants';
import { generateThemeTokens } from '../libs';
import type { ColorGeneratorConfig, ColorPaletteResult, ColorToken, TokenContainer, Tokens } from '../types';
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
 * Primitive와 Semantic 토큰들을 포함한 새로운 구조로 반환합니다.
 *
 * @param [config={}] - 색상 생성기 설정 (선택적)
 * @returns ColorPaletteResult 타입의 base, light, dark 테마 토큰 컨테이너
 *
 * @example generateSystemColorPalette({ colors: { blue: '#448EFE' } })
 *
 * returns: {
 *   base: { tokens: { 'color-white': {...}, 'color-black': {...} }, metadata: { type: 'primitive', theme: 'base' } },
 *   light: {
 *     primitive: { tokens: { 'color-blue-050': {...} }, metadata: { type: 'primitive', theme: 'light' } },
 *     semantic: { tokens: { 'color-background-canvas-100': 'color-white' }, metadata: { type: 'semantic', theme: 'light' } }
 *   },
 *   dark: {
 *     primitive: { tokens: { 'color-blue-050': {...} }, metadata: { type: 'primitive', theme: 'dark' } },
 *     semantic: { tokens: { 'color-background-canvas-100': 'color-gray-050' }, metadata: { type: 'semantic', theme: 'dark' } }
 *   }
 * }
 */
const createSemanticTokens = (theme: 'light' | 'dark'): TokenContainer => {
    const baseSemanticTokens: Tokens = theme === 'light' 
        ? {
            'color-background-canvas-100': 'color-white',
            'color-background-canvas-200': 'color-gray-050',
            'color-background-overlay-100': 'color-white'
        }
        : {
            'color-background-canvas-100': 'color-gray-050',
            'color-background-canvas-200': 'color-gray-100',
            'color-background-overlay-100': 'color-gray-200'
        };

    return {
        tokens: baseSemanticTokens,
        metadata: {
            type: 'semantic',
            theme,
        },
    };
};

const generateSystemColorPalette = (config: ColorGeneratorConfig = {}): ColorPaletteResult => {
    const colors = config.colors || DEFAULT_PRIMITIVE_COLORS;
    const contrastRatios = config.contrastRatios || DEFAULT_CONTRAST_RATIOS;
    const background = config.background || {
        color: '#FFFFFF',
        lightness: DEFAULT_MAIN_BACKGROUND_LIGHTNESS,
        name: 'gray',
    };

    const lightPrimitiveTokens = generateThemeTokens({
        colors,
        contrastRatios,
        backgroundColor: background.color,
        backgroundName: background.name,
        lightness: background.lightness.light,
    });

    const darkPrimitiveTokens = generateThemeTokens({
        colors,
        contrastRatios,
        backgroundColor: background.color,
        backgroundName: background.name,
        lightness: background.lightness.dark,
    });

    const lightPrimitiveContainer: TokenContainer = {
        tokens: lightPrimitiveTokens,
        metadata: {
            type: 'primitive',
            theme: 'light',
        },
    };

    const darkPrimitiveContainer: TokenContainer = {
        tokens: darkPrimitiveTokens,
        metadata: {
            type: 'primitive',
            theme: 'dark',
        },
    };

    // semantic 토큰 생성
    const lightSemanticContainer = createSemanticTokens('light');
    const darkSemanticContainer = createSemanticTokens('dark');

    const baseTokens = createBaseColorTokens(formatOklchForWeb);

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
        light: {
            primitive: lightPrimitiveContainer,
            semantic: lightSemanticContainer,
        },
        dark: {
            primitive: darkPrimitiveContainer,
            semantic: darkSemanticContainer,
        },
    };
};

/* -----------------------------------------------------------------------------------------------*/

export { generateSystemColorPalette, createSemanticTokens };
