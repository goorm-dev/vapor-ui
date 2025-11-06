import type {
    ColorGeneratorPort,
    KeyColor,
    PaletteChip,
    ThemeOptions,
    ThemeResult,
} from '../../domain';
import { DEFAULT_THEME_OPTIONS } from '../constants';
import { applyBrandColorSwap, clampLightness, isValidHexColor } from '../utils';

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
    // 1. 옵션 병합 및 검증
    const mergedOptions = {
        ...DEFAULT_THEME_OPTIONS,
        ...options,
    };

    // Validation
    if (mergedOptions.brandColor && !isValidHexColor(mergedOptions.brandColor.hexcode)) {
        throw new Error(`Invalid brand color hex: ${mergedOptions.brandColor.hexcode}`);
    }

    if (mergedOptions.backgroundColor && !isValidHexColor(mergedOptions.backgroundColor.hexcode)) {
        throw new Error(`Invalid background color hex: ${mergedOptions.backgroundColor.hexcode}`);
    }

    // 2. 통합된 기준점 설정 (Critical)
    const refBg = mergedOptions.backgroundColor;

    // 3. colors 배열 동적 구성
    const colors: KeyColor[] = [];

    // 필수 팔레트: DEFAULT_KEY_COLORS에서 refBg.name과 일치하는 색상 제외
    Object.entries(mergedOptions.keyColors).forEach(([name, hexcode]) => {
        if (name !== refBg.name) {
            colors.push({ name, hexcode });
        }
    });

    // brandColor가 제공되면 추가
    if (options.brandColor) {
        colors.push(options.brandColor);
    }

    // PRD 요구사항: colors 배열은 '기준 배경색'을 포함하지 않아야 합니다.
    // backgroundColor는 Leonardo Adapter에서 별도의 BackgroundColor로 처리됩니다.

    // 4. Lightness 값 클리핑
    const lightLightness = clampLightness(mergedOptions.lightness.light, 'light');
    const darkLightness = clampLightness(mergedOptions.lightness.dark, 'dark');

    // 5. Light Mode 팔레트 생성
    const lightModeTokens = colorGeneratorPort.generatePalette({
        colors,
        backgroundColor: {
            ...refBg,
            lightness: lightLightness,
        },
        contrastRatios: mergedOptions.contrastRatios,
        lightness: lightLightness,
    });

    // 6. Dark Mode 팔레트 생성
    const darkModeTokens = colorGeneratorPort.generatePalette({
        colors,
        backgroundColor: {
            ...refBg,
            lightness: darkLightness,
        },
        contrastRatios: mergedOptions.contrastRatios,
        lightness: darkLightness,
    });

    // 7. Brand Color Swap 적용 (있는 경우)
    if (options.brandColor) {
        const brandColorName = options.brandColor.name;

        // Light Mode에서 브랜드 색상 팔레트 찾아서 스왑
        const lightBrandPalette = lightModeTokens.palettes.find((p) => p.name === brandColorName);
        if (lightBrandPalette) {
            const swappedLightPalette = applyBrandColorSwap(
                lightBrandPalette,
                options.brandColor.hexcode,
            );
            const index = lightModeTokens.palettes.findIndex((p) => p.name === brandColorName);
            lightModeTokens.palettes[index] = swappedLightPalette;
        }

        // Dark Mode에서도 동일하게 적용
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

    // 8. Base Tokens 생성 (color-white, color-black)
    const baseTokens: Record<string, PaletteChip> = {
        'color-white': {
            name: 'color-white',
            hex: '#FFFFFF',
            oklch: 'oklch(1 0 0)',
            deltaE: 0,
            codeSyntax: 'vapor-color-white',
        },
        'color-black': {
            name: 'color-black',
            hex: '#000000',
            oklch: 'oklch(0 0 0)',
            deltaE: 0,
            codeSyntax: 'vapor-color-black',
        },
    };

    return {
        lightModeTokens,
        darkModeTokens,
        baseTokens,
    };
}
