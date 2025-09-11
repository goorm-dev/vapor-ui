import { formatCss, oklch } from 'culori';

import { DEFAULT_CONTRAST_RATIOS } from '../constants';
import { generateThemeTokens } from '../libs';
import type { BrandColorGeneratorConfig, ColorPaletteResult, ColorToken, TokenContainer } from '../types';
import { findClosestScale, formatOklchForWeb, generateCodeSyntax, generateTokenName } from '../utils';

/**
 * TokenContainer의 tokens을 깊은 복사합니다.
 */
function deepCloneTokenContainer(container: TokenContainer): TokenContainer {
    return {
        tokens: Object.fromEntries(
            Object.entries(container.tokens).map(([key, token]) => [
                key,
                typeof token === 'string' ? token : { ...token },
            ])
        ),
        metadata: { ...container.metadata },
    };
}

/**
 * 브랜드 컬러를 사용하여 생성된 토큰 중에서 사용자 지정 색상과 가장 가까운 토큰을 덮어씁니다.
 */
function overrideCustomColorsInContainer(
    container: TokenContainer,
    customColors: Record<string, string>,
): TokenContainer {
    const newContainer = deepCloneTokenContainer(container);

    for (const [colorName, hexValue] of Object.entries(customColors)) {
        if (colorName === 'background') continue;

        // 해당 컬러의 토큰들을 찾아서 palette 형태로 재구성
        const colorTokens: Record<string, ColorToken> = {};
        Object.entries(newContainer.tokens).forEach(([tokenName, token]) => {
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

        newContainer.tokens[updatedToken.name!] = updatedToken;
    }

    return newContainer;
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

    // Generate theme tokens - now returns TokenContainer directly
    const lightContainer = generateThemeTokens(config.colors, contrastRatios, 'light');
    const darkContainer = generateThemeTokens(config.colors, contrastRatios, 'dark');

    // Apply custom color overrides
    const adjustedLightContainer = overrideCustomColorsInContainer(lightContainer, config.colors);
    
    // Remove gray background tokens as they're not brand-specific
    const filteredLightTokens = Object.fromEntries(
        Object.entries(adjustedLightContainer.tokens).filter(([tokenName]) => 
            !tokenName.includes('-gray-') && !tokenName.includes('-background-')
        )
    );
    
    const filteredDarkTokens = Object.fromEntries(
        Object.entries(darkContainer.tokens).filter(([tokenName]) => 
            !tokenName.includes('-gray-') && !tokenName.includes('-background-')
        )
    );

    return {
        light: {
            ...adjustedLightContainer,
            tokens: filteredLightTokens,
        },
        dark: {
            ...darkContainer,
            tokens: filteredDarkTokens,
        },
    };
}


/* -----------------------------------------------------------------------------------------------*/

export { generateBrandColorPalette };
