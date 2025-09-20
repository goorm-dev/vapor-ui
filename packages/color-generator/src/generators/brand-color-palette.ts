import { formatCss, oklch } from 'culori';

import { DEFAULT_CONTRAST_RATIOS, DEFAULT_MAIN_BACKGROUND_LIGHTNESS } from '../constants';
import { generateThemeTokens } from '../libs';
import type { BrandColorGeneratorConfig, ColorPaletteResult, ColorToken, Tokens } from '../types';
import {
    findClosestScale,
    formatOklchForWeb,
    generateCodeSyntax,
    generateTokenName,
} from '../utils';

/**
 * 브랜드 컬러를 사용하여 생성된 토큰 중에서 사용자 지정 색상과 가장 가까운 토큰을 덮어씁니다.
 */
function overrideCustomColors(tokens: Tokens, customColors: Record<string, string>): Tokens {
    const newTokens = { ...tokens };

    for (const [colorName, hexValue] of Object.entries(customColors)) {
        if (colorName === 'background') continue;

        // 해당 컬러의 토큰들을 찾아서 palette 형태로 재구성
        const colorTokens: Record<string, ColorToken> = {};
        Object.entries(newTokens).forEach(([tokenName, token]) => {
            if (typeof token === 'object' && tokenName.includes(`-${colorName}-`)) {
                const scaleMatch = tokenName.match(/-(\d{3})$/);
                if (scaleMatch) {
                    colorTokens[scaleMatch[1]] = token;
                }
            }
        });

        if (Object.keys(colorTokens).length === 0) {
            console.warn(`Palette for "${colorName}" not found in tokens.`);
            continue;
        }

        const closestScaleKey = findClosestScale(colorTokens);
        if (!closestScaleKey) continue;

        const oklchColor = oklch(hexValue);
        const oklchValue = formatCss(oklchColor) ?? '';
        const oklchString = formatOklchForWeb(oklchValue);

        const updatedToken: ColorToken = {
            name: generateTokenName([colorName, closestScaleKey]),
            deltaE: 0,
            hex: hexValue,
            oklch: oklchString,
            codeSyntax: generateCodeSyntax([colorName, closestScaleKey]),
        };

        newTokens[updatedToken.name!] = updatedToken;
    }

    return newTokens;
}

/**
 * 브랜드 컬러 팔레트를 생성합니다.
 * 사용자 정의 브랜드 컬러를 기반으로 Primitive 토큰들을 생성합니다.
 *
 * @param config - 브랜드 컬러 설정
 * @returns 라이트, 다크 테마의 토큰 컨테이너 (base 제외)
 *
 * @example
 * generateBrandColorPalette({ colors: { myBlue: '#448EFE' } })
 * // returns: {
 * //   light: { tokens: { "color-myBlue-050": {...}, "color-myBlue-100": {...} }, metadata: {...} },
 * //   dark: { tokens: { ... }, metadata: {...} }
 * // }
 */
function generateBrandColorPalette(
    config: BrandColorGeneratorConfig,
): Omit<ColorPaletteResult, 'base'> {
    const contrastRatios = config.contrastRatios || DEFAULT_CONTRAST_RATIOS;
    const background = config.background || {
        color: '#FFFFFF',
        name: 'gray',
        lightness: DEFAULT_MAIN_BACKGROUND_LIGHTNESS,
    };

    const lightTokens = generateThemeTokens({
        colors: config.colors,
        contrastRatios,
        backgroundColor: background.color,
        backgroundName: background.name,
        lightness: background.lightness.light,
    });

    const darkTokens = generateThemeTokens({
        colors: config.colors,
        contrastRatios,
        backgroundColor: background.color,
        backgroundName: background.name,
        lightness: background.lightness.dark,
    });

    console.log('Generated light tokens:', lightTokens);

    // Apply custom color overrides
    const adjustedLightTokens = overrideCustomColors(lightTokens, config.colors);

    return {
        light: {
            tokens: adjustedLightTokens,
            metadata: {
                type: 'primitive',
                theme: 'light',
            },
        },
        dark: {
            tokens: darkTokens,
            metadata: {
                type: 'primitive',
                theme: 'dark',
            },
        },
    };
}

/* -----------------------------------------------------------------------------------------------*/

export { generateBrandColorPalette };
