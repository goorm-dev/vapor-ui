import { BASE_COLORS } from '../constants';
import type { ColorToken, ScaleInfo, SemanticMappingConfig } from '../types';
import { getContrastingForegroundColor, getSortedScales } from '../utils';
import { generateBrandColorPalette } from './brand-color-palette';

interface SemanticTokenMapping {
    semanticRole: string;
    brandColorName: string;
    scaleInfo: { backgroundScale: string; foregroundScale: string; alternativeScale: string };
    buttonForegroundColor: ColorToken;
}

function createSemanticTokenMapping(mapping: SemanticTokenMapping): Record<string, string> {
    const { semanticRole, brandColorName, scaleInfo, buttonForegroundColor } = mapping;

    return {
        [`color-background-${semanticRole}`]: `color-${brandColorName}-${scaleInfo.backgroundScale}`,
        [`color-foreground-${semanticRole}-100`]: `color-${brandColorName}-${scaleInfo.foregroundScale}`,
        [`color-foreground-${semanticRole}-200`]: `color-${brandColorName}-${scaleInfo.alternativeScale}`,
        [`color-border-${semanticRole}`]: `color-${brandColorName}-${scaleInfo.backgroundScale}`,
        [`color-button-foreground-${semanticRole}`]: buttonForegroundColor.name || '',
    };
}

/**
 * 라이트 테마용 스케일 정보를 찾습니다.
 * deltaE가 0인 스케일을 배경으로, 그 다음 스케일들을 전경으로 사용합니다.
 * 
 * @param palette - 색상 팔레트
 * @param scales - 정렬된 스케일 배열
 * @returns 배경, 전경, 대체 스케일 정보
 * 
 * @example
 * findLightThemeScales(palette, ['050', '100', '200', '300'])
 * // returns: { backgroundScale: '200', foregroundScale: '300', alternativeScale: '300' }
 */
function findLightThemeScales(
    palette: Record<string, { deltaE?: number }>,
    scales: string[],
): ScaleInfo {
    const backgroundScale = scales.find((scale) => palette[scale]?.deltaE === 0);
    if (!backgroundScale) {
        throw new Error('No scale with deltaE 0 found for light theme background-primary');
    }

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
 * @param scales - 정렬된 스케일 배열
 * @returns 배경, 전경, 대체 스케일 정보
 * 
 * @example
 * findDarkThemeScales(palette, ['050', '100', '200', '300'])
 * // returns: { backgroundScale: '050', foregroundScale: '100', alternativeScale: '200' }
 */
function findDarkThemeScales(
    palette: Record<string, { deltaE?: number }>,
    scales: string[],
): ScaleInfo {
    const backgroundScale = scales.reduce((lowest, current) => {
        const lowestDeltaE = palette[lowest]?.deltaE ?? Infinity;
        const currentDeltaE = palette[current]?.deltaE ?? Infinity;
        return currentDeltaE < lowestDeltaE ? current : lowest;
    });

    const backgroundIndex = scales.indexOf(backgroundScale);
    const foregroundScale = scales[backgroundIndex + 1] ?? backgroundScale;
    const alternativeScale = scales[backgroundIndex + 2] ?? foregroundScale;

    return {
        backgroundScale,
        foregroundScale,
        alternativeScale,
    };
}

function getSemanticDependentTokens(mappingConfig: SemanticMappingConfig): {
    light: Record<string, string>;
    dark: Record<string, string>;
} {
    const lightMapping: Record<string, string> = {};
    const darkMapping: Record<string, string> = {};

    Object.entries(mappingConfig).forEach(([semanticRole, config]) => {
        const brandPalette = generateBrandColorPalette({
            colors: { [config.name]: config.hex },
        });

        const lightPalette = brandPalette.light[config.name];
        const darkPalette = brandPalette.dark[config.name];

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

        const lightTokens = createSemanticTokenMapping({
            semanticRole,
            brandColorName: config.name,
            scaleInfo: lightScaleInfo,
            buttonForegroundColor: lightButtonForegroundColor,
        });
        Object.assign(lightMapping, lightTokens);

        const darkTokens = createSemanticTokenMapping({
            semanticRole,
            brandColorName: config.name,
            scaleInfo: darkScaleInfo,
            buttonForegroundColor: darkButtonForegroundColor,
        });
        Object.assign(darkMapping, darkTokens);
    });

    return {
        light: lightMapping,
        dark: darkMapping,
    };
}

/* -----------------------------------------------------------------------------------------------*/

export { getSemanticDependentTokens };