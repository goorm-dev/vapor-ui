import { BASE_COLORS } from '../constants';
import type { Background, ColorToken, ScaleInfo, SemanticTokensResult, ThemeType } from '../types';
import { findClosestScale, getContrastingForegroundColor, getSortedScales } from '../utils';
import { generateBrandColorPalette } from './brand-color-palette';

/* -------------------------------------------------------------------------------------------------
 * Interfaces
 * -----------------------------------------------------------------------------------------------*/
interface SemanticMappingConfig {
    primary: { name: string; color: string };
    secondary?: { name: string; color: string };
    success?: { name: string; color: string };
    warning?: { name: string; color: string };
    error?: { name: string; color: string };
    background: Background;
}

interface SemanticTokenMapping {
    themeName: ThemeType;
    semanticRole: string;
    brandColorName: string;
    scaleInfo: ScaleInfo;
    buttonForegroundColor: ColorToken;
}

/* -------------------------------------------------------------------------------------------------
 * Helper Functions
 * -----------------------------------------------------------------------------------------------*/

/**
 * 전체 토큰 맵에서 특정 색상에 해당하는 팔레트만 추출하여 재구성합니다.
 */
const reconstructPalette = (
    sourceTokens: Record<string, ColorToken | string>,
    colorName: string,
): Record<string, ColorToken> => {
    const palette: Record<string, ColorToken> = {};
    Object.entries(sourceTokens).forEach(([tokenName, token]) => {
        const isRelatedToken = typeof token === 'object' && tokenName.includes(`-${colorName}-`);
        if (isRelatedToken) {
            const scaleMatch = tokenName.match(/-(\d{3})$/);
            if (scaleMatch) {
                const scale = scaleMatch[1];
                palette[scale] = token;
            }
        }
    });
    return palette;
}

/**
 * 배경 토큰의 oklch 값을 기반으로 대비가 높은 버튼 전경색을 결정합니다.
 */
const determineButtonForegroundColor = (backgroundToken: ColorToken | undefined): ColorToken => {
    if (backgroundToken?.oklch) {
        return getContrastingForegroundColor(backgroundToken.oklch);
    }
    return { ...BASE_COLORS.white };
}

const createSemanticTokenMapping = ({
    themeName,
    semanticRole,
    brandColorName,
    scaleInfo,
    buttonForegroundColor,
}: SemanticTokenMapping): {
    semantic: Record<string, string>;
    componentSpecific: Record<string, string>;
} => {
    const background100Scale = themeName === 'dark' ? 800 : 100;

    return {
        semantic: {
            [`color-background-${semanticRole}-100`]: `color-${brandColorName}-${background100Scale}`,
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
 * '400': { deltaE: 0 },   // 이 스케일이 background
 * '500': { deltaE: 12 },  // 그 다음 스케일이 foreground
 * '600': { deltaE: 25 },  // 다다음 스케일이 alternative
 * };
 * const scales = ['300', '400', '500', '600'];
 *
 * findLightThemeScales(palette, scales)
 * // returns: { backgroundScale: '400', foregroundScale: '500', alternativeScale: '600' }
 */
const findLightThemeScales = (
    palette: Record<string, { deltaE?: number }>,
    scales: string[],
): ScaleInfo => {
    const deltaEZeroScale = scales.find((scale) => palette[scale]?.deltaE === 0);
    if (!deltaEZeroScale) {
        throw new Error('No scale with deltaE 0 found for light theme');
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
 * '800': { deltaE: 0.35 },  // deltaE가 가장 낮으므로 이 스케일이 background
 * '900': { deltaE: 13.97 }, // 그 다음 스케일이 foreground
 * };
 * const scales = ['600', '700', '800', '900'];
 *
 * findDarkThemeScales(palette, scales)
 * // returns: { backgroundScale: '800', foregroundScale: '900', alternativeScale: '900' } // '900'이 마지막 스케일이므로 foreground와 alternative가 동일
 */
const findDarkThemeScales = (
    palette: Record<string, { deltaE?: number }>,
    scales: string[],
): ScaleInfo => {
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

/* -------------------------------------------------------------------------------------------------
 * Main Function
 * -----------------------------------------------------------------------------------------------*/

/**
 * 시맨틱 토큰을 생성합니다.
 * 브랜드 컬러를 기반으로 semantic과 component-specific 토큰을 분리하여 생성합니다.
 *
 * @param mappingConfig - 시맨틱 역할과 브랜드 컬러 매핑 설정
 * @returns semantic과 componentSpecific으로 분리된 토큰 컨테이너
 */
const getSemanticDependentTokens = (mappingConfig: SemanticMappingConfig): SemanticTokensResult => {
    const lightSemanticMapping: Record<string, string> = {};
    const lightComponentMapping: Record<string, string> = {};
    const darkSemanticMapping: Record<string, string> = {};
    const darkComponentMapping: Record<string, string> = {};

    const brandColors: Record<string, string> = {};
    Object.entries(mappingConfig).forEach(([semanticRole, config]) => {
        if (semanticRole !== 'background') {
            brandColors[config.name] = config.color;
        }
    });

    const brandPalette = generateBrandColorPalette({
        colors: brandColors,
        background: mappingConfig.background,
    });

    Object.entries(mappingConfig).forEach(([semanticRole, config]) => {
        if (semanticRole === 'background') return;

        const themes = [
            {
                name: 'light' as ThemeType,
                tokens: brandPalette.light.tokens,
                findScales: findLightThemeScales,
                semanticMappingTarget: lightSemanticMapping,
                componentMappingTarget: lightComponentMapping,
            },
            {
                name: 'dark' as ThemeType,
                tokens: brandPalette.dark.tokens,
                findScales: findDarkThemeScales,
                semanticMappingTarget: darkSemanticMapping,
                componentMappingTarget: darkComponentMapping,
            },
        ];

        for (const theme of themes) {
            const palette = reconstructPalette(theme.tokens, config.name);
            const scales = getSortedScales(palette);
            const scaleInfo = theme.findScales(palette, scales);
            const backgroundToken = palette[scaleInfo.backgroundScale];
            const buttonForegroundColor = determineButtonForegroundColor(backgroundToken);

            const tokenMappings = createSemanticTokenMapping({
                themeName: theme.name,
                semanticRole,
                brandColorName: config.name,
                scaleInfo,
                buttonForegroundColor,
            });

            Object.assign(theme.semanticMappingTarget, tokenMappings.semantic);
            Object.assign(theme.componentMappingTarget, tokenMappings.componentSpecific);
        }
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

export type { SemanticMappingConfig };
export { getSemanticDependentTokens };
