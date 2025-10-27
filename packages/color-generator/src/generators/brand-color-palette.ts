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
 * 사용자 지정 색상(customColors)을 기반으로 기존 토큰(tokens) 객체의 색상 값을 덮어씁니다.
 *
 * @param tokens - 덮어쓰기의 대상이 될 원본 토큰 객체
 * @param customColors - 적용할 색상. { '색상이름': '새로운 hex값' } 형태
 * @returns 사용자 지정 색상이 적용된 새로운 토큰 객체
 *
 * @example overrideCustomColors(tokens, { primary: '#0808dbff' })
 *
 * returns: {
 *   'color-primary-500': { name: '...', hex: '#0808dbff', oklch: '...', deltaE: 0 },
 *   'color-primary-600': { name: '...', hex: '#0000DD', oklch: '...', deltaE: 25 }
 * }
 */
const overrideCustomColors = (tokens: Tokens, customColors: Record<string, string>): Tokens => {
    const newTokens = { ...tokens };

    for (const [colorName, hexValue] of Object.entries(customColors)) {
        if (colorName === 'background') continue;

        // 토큰 구조 재구성
        const colorTokens: Record<string, ColorToken> = {};
        Object.entries(newTokens).forEach(([tokenName, token]) => {
            const isRelatedColorToken =
                token && typeof token === 'object' && tokenName.includes(`-${colorName}-`);

            if (isRelatedColorToken) {
                const scaleMatch = tokenName.match(/-(\d{3})$/);
                if (scaleMatch) {
                    const scale = scaleMatch[1];
                    colorTokens[scale] = token;
                }
            }
        });

        if (Object.keys(colorTokens).length === 0) {
            console.warn(`Palette for "${colorName}" not found in tokens.`);
            continue;
        }

        // deltaE 기준으로 가장 가까운 스케일 찾기
        const closestScaleKey = findClosestScale(colorTokens);
        if (!closestScaleKey) continue;

        const oklchColor = oklch(hexValue);
        const oklchValue = formatCss(oklchColor) ?? '';
        const oklchString = formatOklchForWeb(oklchValue);

        const tokenIdentifier = [colorName, closestScaleKey];
        const updatedTokenName = generateTokenName(tokenIdentifier);

        const updatedToken: ColorToken = {
            name: updatedTokenName,
            deltaE: 0,
            hex: hexValue,
            oklch: oklchString,
            codeSyntax: generateCodeSyntax(tokenIdentifier),
        };

        newTokens[updatedTokenName] = updatedToken;
    }

    return newTokens;
};

/**
 * 브랜드 컬러 팔레트를 생성합니다.
 * 사용자 정의 브랜드 컬러를 기반으로 Primitive 토큰들을 생성합니다.
 *
 * @param config - BrandColorGeneratorConfig 타입의 브랜드 컬러 설정 (필수)
 * @returns BrandColorPalette 타입의 light, dark 테마 컨테이너 (base 제외)
 *
 * @example generateBrandColorPalette({ colors: { myBlue: '#448EFE' } })
 *
 * returns: {
 *   light: { 
 *     primitive: { tokens: { 'color-myBlue-050': {...} }, metadata: { type: 'primitive', theme: 'light' } },
 *     semantic: { tokens: {}, metadata: { type: 'semantic', theme: 'light' } }
 *   },
 *   dark: { 
 *     primitive: { tokens: { 'color-myBlue-050': {...} }, metadata: { type: 'primitive', theme: 'dark' } },
 *     semantic: { tokens: {}, metadata: { type: 'semantic', theme: 'dark' } }
 *   }
 * }
 */
type BrandColorPalette = Omit<ColorPaletteResult, 'base'>;

const generateBrandColorPalette = (config: BrandColorGeneratorConfig): BrandColorPalette => {
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

    // Apply custom color overrides
    const adjustedLightTokens = overrideCustomColors(lightTokens, config.colors);

    return {
        light: {
            primitive: {
                tokens: adjustedLightTokens,
                metadata: {
                    type: 'primitive',
                    theme: 'light',
                },
            },
            semantic: {
                tokens: {},
                metadata: {
                    type: 'semantic',
                    theme: 'light',
                },
            },
        },
        dark: {
            primitive: {
                tokens: darkTokens,
                metadata: {
                    type: 'primitive',
                    theme: 'dark',
                },
            },
            semantic: {
                tokens: {},
                metadata: {
                    type: 'semantic',
                    theme: 'dark',
                },
            },
        },
    };
};

/* -----------------------------------------------------------------------------------------------*/

export { generateBrandColorPalette };
