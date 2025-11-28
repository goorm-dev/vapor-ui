import type { ColorGeneratorPort, KeyColor, ThemeOptions, ThemeResult } from '../../domain';
import { BASE_TOKENS, DEFAULT_THEME_OPTIONS } from '../constants';
import { applyBrandColorSwap, isValidHexColor } from '../utils';

/**
 * generatePrimitiveColorPalette Use Case
 *
 * 시스템의 모든 Primitive Color Token을 생성하는 핵심 함수입니다.
 * leonardoAdapter를 사용하여 단일 기준 배경색을 기반으로 모든 필수 팔레트를 일관되게 생성합니다.
 */
export function generatePrimitiveColorPalette(
    colorGeneratorPort: ColorGeneratorPort,
    options: Partial<ThemeOptions> = {},
): ThemeResult {
    const mergedOptions = {
        ...DEFAULT_THEME_OPTIONS,
        ...options,
    };

    if (mergedOptions.brandColor && !isValidHexColor(mergedOptions.brandColor.hexcode)) {
        throw new Error(`Invalid brand color hex: ${mergedOptions.brandColor.hexcode}`);
    }

    if (mergedOptions.backgroundColor && !isValidHexColor(mergedOptions.backgroundColor.hexcode)) {
        throw new Error(`Invalid background color hex: ${mergedOptions.backgroundColor.hexcode}`);
    }

    const refBg = mergedOptions.backgroundColor;
    const colors: KeyColor[] = [];

    // brandColor 이름이 keyColors에 존재하면 대체, 아니면 추가
    Object.entries(mergedOptions.keyColors).forEach(([name, hexcode]) => {
        if (options.brandColor && options.brandColor.name === name) {
            colors.push(options.brandColor);
        } else {
            colors.push({ name, hexcode });
        }
    });

    if (options.brandColor) {
        const brandColorExistsInKeyColors = Object.keys(mergedOptions.keyColors).includes(
            options.brandColor.name,
        );
        if (!brandColorExistsInKeyColors) {
            colors.push(options.brandColor);
        }
    }

    const backgroundLightness =
        mergedOptions.backgroundColor.lightness ?? DEFAULT_THEME_OPTIONS.backgroundColor.lightness;

    const lightLightness = backgroundLightness!.light;
    const darkLightness = backgroundLightness!.dark;

    const lightModeTokens = colorGeneratorPort.generatePalette({
        colors,
        backgroundColor: refBg,
        contrastRatios: mergedOptions.contrastRatios,
        lightness: lightLightness,
    });

    const darkModeTokens = colorGeneratorPort.generatePalette({
        colors,
        backgroundColor: refBg,
        contrastRatios: mergedOptions.contrastRatios,
        lightness: darkLightness,
    });

    if (options.brandColor) {
        const brandColorName = options.brandColor.name;

        const lightBrandPalette = lightModeTokens.palettes.find((p) => p.name === brandColorName);
        if (lightBrandPalette) {
            const swappedLightPalette = applyBrandColorSwap(
                lightBrandPalette,
                options.brandColor.hexcode,
            );
            const index = lightModeTokens.palettes.findIndex((p) => p.name === brandColorName);
            lightModeTokens.palettes[index] = swappedLightPalette;
        }

        const darkBrandPalette = darkModeTokens.palettes.find((p) => p.name === brandColorName);
        if (darkBrandPalette) {
            const swappedDarkPalette = applyBrandColorSwap(
                darkBrandPalette,
                options.brandColor.hexcode,
            );
            const index = darkModeTokens.palettes.findIndex((p) => p.name === brandColorName);
            darkModeTokens.palettes[index] = swappedDarkPalette;
        }
    }

    return {
        lightModeTokens,
        darkModeTokens,
        baseTokens: BASE_TOKENS,
    };
}
