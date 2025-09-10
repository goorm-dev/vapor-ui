import { BASE_COLORS } from '../constants';
import { generateBrandColorPalette } from '../primitive';
import type { ColorToken, ScaleInfo } from '../types';
import { getContrastingForegroundColor } from '../utils/color';

/* -------------------------------------------------------------------------------------------------
 * Independent Semantic Mapping API
 * -----------------------------------------------------------------------------------------------*/

export interface SemanticMappingConfig {
    primary: { name: string; hex: string };
    secondary?: { name: string; hex: string };
    success?: { name: string; hex: string };
    warning?: { name: string; hex: string };
    error?: { name: string; hex: string };
}

export function getSemanticDependentTokens(mappingConfig: SemanticMappingConfig): {
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

        // 배경 색상의 OKLCH 값을 가져와서 적절한 button foreground 색상 결정
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

/* -------------------------------------------------------------------------------------------------
 * Internal Processing Logic
 * -----------------------------------------------------------------------------------------------*/

interface SemanticTokenMapping {
    semanticRole: string;
    brandColorName: string;
    scaleInfo: ScaleInfo;
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

function getSortedScales(palette: Record<string, unknown>): string[] {
    return Object.keys(palette).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
}

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
