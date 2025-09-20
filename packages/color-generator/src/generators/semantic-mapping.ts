import { BASE_COLORS } from '../constants';
import type { Background, ColorToken, ScaleInfo, SemanticTokensResult } from '../types';
import { findClosestScale, getContrastingForegroundColor, getSortedScales } from '../utils';
import { generateBrandColorPalette } from './brand-color-palette';

interface SemanticMappingConfig {
    primary: { name: string; hex: string };
    secondary?: { name: string; hex: string };
    success?: { name: string; hex: string };
    warning?: { name: string; hex: string };
    error?: { name: string; hex: string };
    background?: Background;
}

interface SemanticTokenMapping {
    semanticRole: string;
    brandColorName: string;
    scaleInfo: { backgroundScale: string; foregroundScale: string; alternativeScale: string };
    buttonForegroundColor: ColorToken;
}

function createSemanticTokenMapping(mapping: SemanticTokenMapping): {
    semantic: Record<string, string>;
    componentSpecific: Record<string, string>;
} {
    const { semanticRole, brandColorName, scaleInfo, buttonForegroundColor } = mapping;

    return {
        semantic: {
            [`color-background-${semanticRole}-100`]: `color-${brandColorName}-${scaleInfo.backgroundScale}`,
            [`color-background-${semanticRole}-200`]: `color-${brandColorName}-${scaleInfo.backgroundScale}`,
            [`color-foreground-${semanticRole}-100`]: `color-${brandColorName}-${scaleInfo.foregroundScale}`,
            [`color-foreground-${semanticRole}-200`]: `color-${brandColorName}-${scaleInfo.alternativeScale}`,
            [`color-border-${semanticRole}`]: `color-${brandColorName}-${scaleInfo.backgroundScale}`,
        },
        componentSpecific: {
            [`color-button-foreground-${semanticRole}`]: buttonForegroundColor.name!,
        },
    };
}

/**
 * 라이트 테마용 스케일 정보를 찾습니다.
 * deltaE가 0인 스케일을 배경으로, 그 다음 스케일들을 전경으로 사용합니다.
 *
 * @param palette - 색상 팔레트
 * @param scales - 명도순으로 정렬된 스케일 배열
 * @returns 배경, 전경, 대체 스케일 정보
 *
 * @example
 * // palette에서 '400' 스케일의 deltaE가 0이라고 가정
 * const palette = {
 * '300': { deltaE: 15 },
 * '400': { deltaE: 0 },   // 👈 이 스케일이 배경(background)이 됨
 * '500': { deltaE: 12 },  // 👈 그 다음 스케일이 전경(foreground)
 * '600': { deltaE: 25 },  // 👈 다다음 스케일이 대체(alternative)
 * };
 * const scales = ['300', '400', '500', '600'];
 *
 * findLightThemeScales(palette, scales)
 * // returns: { backgroundScale: '400', foregroundScale: '500', alternativeScale: '600' }
 */
function findLightThemeScales(
    palette: Record<string, { deltaE?: number }>,
    scales: string[],
): ScaleInfo {
    const deltaEZeroScale = scales.find((scale) => palette[scale]?.deltaE === 0);
    if (!deltaEZeroScale) {
        throw new Error('No scale with deltaE 0 found for light theme background-primary');
    }

    const backgroundScale = deltaEZeroScale;
    const backgroundIndex = scales.indexOf(backgroundScale);
    const foregroundScale = scales[backgroundIndex + 1] ?? backgroundScale;
    const alternativeScale = scales[backgroundIndex + 2] ?? foregroundScale;

    return { backgroundScale, foregroundScale, alternativeScale };
}

/**
 * 다크 테마용 스케일 정보를 찾습니다.
 * deltaE가 가장 낮은 스케일을 배경으로, 그 다음 스케일들을 전경으로 사용합니다.
 *
 * @param palette - 색상 팔레트
 * @param scales - 명도순으로 정렬된 스케일 배열
 * @returns 배경, 전경, 대체 스케일 정보
 *
 * @example
 * // palette에서 '800' 스케일의 deltaE가 가장 낮다고 가정
 * const palette = {
 * '600': { deltaE: 14.44 },
 * '700': { deltaE: 7.53 },
 * '800': { deltaE: 0.35 },  // 👈 deltaE가 가장 낮으므로 이 스케일이 배경(background)
 * '900': { deltaE: 13.97 }, // 👈 그 다음 스케일이 전경(foreground)
 * };
 * const scales = ['600', '700', '800', '900'];
 *
 * findDarkThemeScales(palette, scales)
 * // returns: { backgroundScale: '800', foregroundScale: '900', alternativeScale: '900' }
 */
function findDarkThemeScales(
    palette: Record<string, { deltaE?: number }>,
    scales: string[],
): ScaleInfo {
    const backgroundScale = findClosestScale(palette);

    if (!backgroundScale) {
        throw new Error('Could not find a valid background scale in the palette for dark theme.');
    }

    const backgroundIndex = scales.indexOf(backgroundScale);
    const foregroundScale = scales[backgroundIndex + 1] ?? backgroundScale;
    const alternativeScale = scales[backgroundIndex + 2] ?? foregroundScale;

    return {
        backgroundScale,
        foregroundScale,
        alternativeScale,
    };
}

/**
 * 시맨틱 토큰을 생성합니다.
 * 브랜드 컬러를 기반으로 semantic과 component-specific 토큰을 분리하여 생성합니다.
 *
 * @param mappingConfig - 시맨틱 역할과 브랜드 컬러 매핑 설정
 * @returns semantic과 componentSpecific으로 분리된 토큰 컨테이너
 *
 * @example
 * getSemanticDependentTokens({ primary: { name: 'myBlue', hex: '#448EFE' } })
 * // returns: {
 * //   semantic: {
 * //     light: { tokens: { "color-background-primary": "color-myBlue-500" }, metadata: {...} },
 * //     dark: { tokens: { "color-background-primary": "color-myBlue-400" }, metadata: {...} }
 * //   },
 * //   componentSpecific: {
 * //     light: { tokens: { "color-button-foreground-primary": "color-white" }, metadata: {...} },
 * //     dark: { tokens: { "color-button-foreground-primary": "color-white" }, metadata: {...} }
 * //   }
 * // }
 */
function getSemanticDependentTokens(mappingConfig: SemanticMappingConfig): SemanticTokensResult {
    const lightSemanticMapping: Record<string, string> = {};
    const lightComponentMapping: Record<string, string> = {};
    const darkSemanticMapping: Record<string, string> = {};
    const darkComponentMapping: Record<string, string> = {};

    // Extract all brand colors first
    const brandColors: Record<string, string> = {};
    Object.entries(mappingConfig).forEach(([semanticRole, config]) => {
        if (semanticRole !== 'background') {
            brandColors[config.name] = config.hex;
        }
    });

    // Generate brand palette once for all colors
    const brandPalette = generateBrandColorPalette({
        colors: brandColors,
        background: mappingConfig.background,
    });

    Object.entries(mappingConfig).forEach(([semanticRole, config]) => {
        if (semanticRole === 'background') return; // Skip background config entry

        // Extract color tokens from TokenContainer format
        const lightTokens = brandPalette.light.tokens;
        const darkTokens = brandPalette.dark.tokens;

        // Group tokens by color name to reconstruct palette structure
        const lightPalette: Record<string, ColorToken> = {};
        const darkPalette: Record<string, ColorToken> = {};

        Object.entries(lightTokens).forEach(([tokenName, token]) => {
            if (typeof token === 'object' && tokenName.includes(`-${config.name}-`)) {
                const scaleMatch = tokenName.match(/-(\d{3})$/);
                if (scaleMatch) {
                    lightPalette[scaleMatch[1]] = token;
                }
            }
        });

        Object.entries(darkTokens).forEach(([tokenName, token]) => {
            if (typeof token === 'object' && tokenName.includes(`-${config.name}-`)) {
                const scaleMatch = tokenName.match(/-(\d{3})$/);
                if (scaleMatch) {
                    darkPalette[scaleMatch[1]] = token;
                }
            }
        });

        const lightScales = getSortedScales(lightPalette);
        const darkScales = getSortedScales(darkPalette);

        const lightScaleInfo = findLightThemeScales(lightPalette, lightScales);
        const darkScaleInfo = findDarkThemeScales(darkPalette, darkScales);

        const lightBackgroundToken = lightPalette[lightScaleInfo.backgroundScale];
        const darkBackgroundToken = darkPalette[darkScaleInfo.backgroundScale];

        const lightButtonForegroundColor: ColorToken = lightBackgroundToken?.oklch
            ? getContrastingForegroundColor(lightBackgroundToken.oklch)
            : { ...BASE_COLORS.white };

        const darkButtonForegroundColor: ColorToken = darkBackgroundToken?.oklch
            ? getContrastingForegroundColor(darkBackgroundToken.oklch)
            : { ...BASE_COLORS.white };

        const lightTokenMappings = createSemanticTokenMapping({
            semanticRole,
            brandColorName: config.name,
            scaleInfo: lightScaleInfo,
            buttonForegroundColor: lightButtonForegroundColor,
        });
        Object.assign(lightSemanticMapping, lightTokenMappings.semantic);
        Object.assign(lightComponentMapping, lightTokenMappings.componentSpecific);

        const darkTokenMappings = createSemanticTokenMapping({
            semanticRole,
            brandColorName: config.name,
            scaleInfo: darkScaleInfo,
            buttonForegroundColor: darkButtonForegroundColor,
        });
        Object.assign(darkSemanticMapping, darkTokenMappings.semantic);
        Object.assign(darkComponentMapping, darkTokenMappings.componentSpecific);
    });

    return {
        semantic: {
            light: {
                tokens: lightSemanticMapping,
                metadata: {
                    type: 'semantic',
                    theme: 'light',
                },
            },
            dark: {
                tokens: darkSemanticMapping,
                metadata: {
                    type: 'semantic',
                    theme: 'dark',
                },
            },
        },
        componentSpecific: {
            light: {
                tokens: lightComponentMapping,
                metadata: {
                    type: 'component-specific',
                    theme: 'light',
                },
            },
            dark: {
                tokens: darkComponentMapping,
                metadata: {
                    type: 'component-specific',
                    theme: 'dark',
                },
            },
        },
    };
}

/* -----------------------------------------------------------------------------------------------*/

export type { SemanticMappingConfig };
export { getSemanticDependentTokens };
