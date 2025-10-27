import { BASE_COLORS } from '../constants';
import type {
    Background,
    ColorToken,
    ScaleInfo,
    SemanticTokensResult,
    ThemeType,
    Tokens,
} from '../types';
import { findClosestScale, getContrastingForegroundColor, getSortedScales } from '../utils';
import { generateBrandColorPalette } from './brand-color-palette';

/* -------------------------------------------------------------------------------------------------
 * Interfaces
 * -----------------------------------------------------------------------------------------------*/
interface SemanticMappingConfig {
    primary: { name: string; color: string };
    background: Background;
}

interface SemanticTokenMapping {
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
 *
 * @param sourceTokens - Tokens 타입의 전체 토큰 맵
 * @param colorName - 추출할 색상 이름 (ex: 'primary', 'blue')
 * @returns Record<string, ColorToken> 타입의 재구성된 색상 팔레트
 *
 * @example reconstructPalette(tokens, 'primary')
 *
 * returns: {
 *   '050': { name: 'color-primary-050', hex: '#f0f0ff', oklch: '...' },
 *   '100': { name: 'color-primary-100', hex: '#e0e0ff', oklch: '...' }
 * }
 */
const reconstructPalette = (
    sourceTokens: Tokens,
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
};

/**
 * 배경 토큰의 oklch 값을 기반으로 대비가 높은 버튼 전경색을 결정합니다.
 *
 * @param backgroundToken - 배경 컬러 토큰
 * @returns 대비가 높은 전경색 토큰
 *
 * @example determineButtonForegroundColor(backgroundToken)
 *
 * returns: {
 *   name: 'color-white',
 *   hex: '#ffffff',
 *   oklch: 'oklch(1 0 0)'
 * }
 */
const determineButtonForegroundColor = (backgroundToken: ColorToken | undefined): ColorToken => {
    if (backgroundToken?.oklch) {
        return getContrastingForegroundColor(backgroundToken.oklch);
    }
    return { ...BASE_COLORS.white };
};

const createSemanticTokenMapping = ({
    semanticRole,
    brandColorName,
    scaleInfo,
    buttonForegroundColor,
}: SemanticTokenMapping): {
    semantic: Record<string, string>;
    componentSpecific: Record<string, string>;
} => {
    return {
        semantic: {
            [`color-background-${semanticRole}-100`]: `color-${brandColorName}-${scaleInfo.background100Scale}`,
            [`color-background-${semanticRole}-200`]: `color-${brandColorName}-${scaleInfo.background200Scale}`,
            [`color-foreground-${semanticRole}-100`]: `color-${brandColorName}-${scaleInfo.foreground100Scale}`,
            [`color-foreground-${semanticRole}-200`]: `color-${brandColorName}-${scaleInfo.foreground200Scale}`,
            [`color-border-${semanticRole}`]: `color-${brandColorName}-${scaleInfo.borderScale}`,
        },
        componentSpecific: {
            [`color-button-foreground-${semanticRole}`]: buttonForegroundColor.name!,
        },
    };
};

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

    const background200Scale = deltaEZeroScale;
    const backgroundIndex = scales.indexOf(background200Scale);

    const background100Scale = deltaEZeroScale === '050' ? '050' : '100'; // 라이트 테마에서는 항상 050 또는 100으로 사용
    const borderScale = deltaEZeroScale;
    const foreground100Scale = scales[backgroundIndex + 1] ?? background200Scale;
    const foreground200Scale = scales[backgroundIndex + 2] ?? foreground100Scale;

    return {
        background100Scale,
        background200Scale,
        borderScale,
        foreground100Scale,
        foreground200Scale,
    };
};

/**
 * 다크 테마용 스케일 정보를 찾습니다.
 * deltaE가 가장 낮은 스케일을 배경으로, 그 다음 스케일들을 전경으로 사용합니다.
 *
 * @param palette - 색상 팔레트
 * @param scales - 명도순으로 정렬된 스케일 배열
 * @returns 배경, 전경, 대체 스케일 정보
 *
 * @example findDarkThemeScales(palette, ['600', '700', '800', '900'])
 *
 * returns: {
 *   backgroundScale: '800',
 *   foregroundScale: '900',
 *   alternativeScale: '900'
 * }
 */
const findDarkThemeScales = (
    palette: Record<string, { deltaE?: number }>,
    scales: string[],
): ScaleInfo => {
    const deltaELowestScale = findClosestScale(palette);

    if (!deltaELowestScale) {
        throw new Error('Could not find a valid background scale in the palette for dark theme.');
    }

    const background200Scale = deltaELowestScale;
    const backgroundIndex = scales.indexOf(deltaELowestScale);

    const background100Scale = '050'; // 다크 테마에서는 항상 050으로 사용
    const borderScale = deltaELowestScale;
    const foreground100Scale = scales[backgroundIndex + 1] ?? background200Scale;
    const foreground200Scale = scales[backgroundIndex + 2] ?? foreground100Scale;

    return {
        background100Scale,
        background200Scale,
        borderScale,
        foreground100Scale,
        foreground200Scale,
    };
};

/**
 * 특정 테마에 대한 시맨틱 토큰 매핑을 생성합니다.
 *
 * @param config - 테마 토큰 생성 설정
 * @param config.tokens - 브랜드 팔레트 토큰들
 * @param config.themeName - 테마 이름
 * @param config.brandColorName - 브랜드 컬러 이름
 * @returns semantic과 componentSpecific 토큰 매핑
 *
 * @example createThemeTokens({ tokens, themeName: 'light', brandColorName: 'blue' })
 *
 * returns: {
 *   semantic: { 'color-background-primary-100': 'color-blue-100' },
 *   componentSpecific: { 'color-button-foreground-primary': 'color-white' }
 * }
 */
const createThemeTokens = ({
    tokens,
    themeName,
    brandColorName,
}: {
    tokens: Tokens;
    themeName: ThemeType;
    brandColorName: string;
}): {
    semantic: Record<string, string>;
    componentSpecific: Record<string, string>;
} => {
    // background는 제거 후, primary 색상 팔레트만 재구성
    const palette = reconstructPalette(tokens, brandColorName);

    console.log('-------------palette--------------');
    console.log(palette);
    console.log('---------------------------------');

    const scales = getSortedScales(palette);
    const scaleInfo =
        themeName === 'light'
            ? findLightThemeScales(palette, scales)
            : findDarkThemeScales(palette, scales);

    console.log('-------------scaleInfo--------------');
    console.log(scaleInfo);
    console.log('---------------------------------');

    const backgroundToken = palette[scaleInfo.background200Scale];
    const buttonForegroundColor = determineButtonForegroundColor(backgroundToken);

    return createSemanticTokenMapping({
        semanticRole: 'primary',
        brandColorName,
        scaleInfo,
        buttonForegroundColor,
    });
};

/* -------------------------------------------------------------------------------------------------
 * Main Function
 * -----------------------------------------------------------------------------------------------*/

/**
 * 시맨틱 토큰을 생성합니다.
 * 브랜드 컬러를 기반으로 semantic과 component-specific 토큰을 분리하여 생성합니다.
 *
 * @param mappingConfig - SemanticMappingConfig 타입의 시맨틱 역할과 브랜드 컬러 매핑 설정
 * @returns SemanticTokensResult 타입의 semantic과 componentSpecific 토큰 컨테이너
 *
 * @example getSemanticDependentTokens({ primary: { name: 'blue', color: '#448EFE' }, background: { color: '#ffffff', name: 'gray', lightness: { light: 90, dark: 10 } } })
 *
 * returns: {
 *   semantic: {
 *     light: { tokens: { 'color-background-primary-100': 'color-blue-100' }, metadata: { type: 'semantic', theme: 'light' } },
 *     dark: { tokens: { 'color-background-primary-100': 'color-blue-800' }, metadata: { type: 'semantic', theme: 'dark' } }
 *   },
 *   componentSpecific: {
 *     light: { tokens: { 'color-button-foreground-primary': 'color-white' }, metadata: { type: 'component-specific', theme: 'light' } },
 *     dark: { tokens: { 'color-button-foreground-primary': 'color-white' }, metadata: { type: 'component-specific', theme: 'dark' } }
 *   }
 * }
 */
const getSemanticDependentTokens = (mappingConfig: SemanticMappingConfig): SemanticTokensResult => {
    const brandPalette = generateBrandColorPalette({
        colors: { [mappingConfig.primary.name]: mappingConfig.primary.color },
        background: mappingConfig.background,
    });

    console.log('------------brandPalette---------------');
    console.log(brandPalette);
    console.log('---------------------------------');

    const lightTokens = createThemeTokens({
        tokens: brandPalette.light.tokens,
        themeName: 'light',
        brandColorName: mappingConfig.primary.name,
    });
    const darkTokens = createThemeTokens({
        tokens: brandPalette.dark.tokens,
        themeName: 'dark',
        brandColorName: mappingConfig.primary.name,
    });

    return {
        semantic: {
            light: {
                tokens: lightTokens.semantic,
                metadata: {
                    type: 'semantic',
                    theme: 'light',
                },
            },
            dark: {
                tokens: darkTokens.semantic,
                metadata: {
                    type: 'semantic',
                    theme: 'dark',
                },
            },
        },
        componentSpecific: {
            light: {
                tokens: lightTokens.componentSpecific,
                metadata: {
                    type: 'component-specific',
                    theme: 'light',
                },
            },
            dark: {
                tokens: darkTokens.componentSpecific,
                metadata: {
                    type: 'component-specific',
                    theme: 'dark',
                },
            },
        },
    };
};

export type { SemanticMappingConfig };
export { getSemanticDependentTokens };
