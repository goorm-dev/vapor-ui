import type { CssColor } from '@adobe/leonardo-contrast-colors';
import { BackgroundColor, Color, Theme } from '@adobe/leonardo-contrast-colors';
import { differenceCiede2000, formatCss, formatHex, oklch } from 'culori';

import { ADAPTIVE_COLOR_GENERATION } from '../constants';
import type { Background, ColorToken, Colors, ContrastRatios, OklchColor, Tokens } from '../types';
import { formatOklchForWeb, generateCodeSyntax, generateTokenName } from '../utils';

/**
 * 입력 색상의 명도를 분석하여 최적의 Light/Dark Key 쌍을 생성합니다.
 * 밝은 색상은 어두운 Key를, 어두운 색상은 밝은 Key를 생성하여 duoKey를 구성합니다.
 *
 * @param brandColorOklch - 브랜드 색상의 OKLCH 객체
 * @param originalHex - 원본 HEX 색상 문자열
 * @returns Light/Dark 테마용 색상 키 쌍
 *
 * @example createAdaptiveColorKeys({ mode: 'oklch', l: 0.8, c: 0.15, h: 180 }, '#87CEEB')
 *
 * returns: {
 *   lightKey: '#87CEEB',
 *   darkKey: '#4A90A4'
 * }
 */
const createAdaptiveColorKeys = (
    brandColorOklch: OklchColor,
    originalHex: string,
): { lightKey: CssColor; darkKey: CssColor } => {
    const isLightColor = brandColorOklch.l > ADAPTIVE_COLOR_GENERATION.LIGHTNESS_THRESHOLD;

    if (isLightColor) {
        const darkerKeyOklch: OklchColor = {
            ...brandColorOklch,
            mode: 'oklch',
            l: brandColorOklch.l * ADAPTIVE_COLOR_GENERATION.DARK_LIGHTNESS_FACTOR,
            c: brandColorOklch.c * ADAPTIVE_COLOR_GENERATION.CHROMA_REDUCTION_FACTOR,
        };

        const darkKeyHex = formatHex(darkerKeyOklch);
        return {
            lightKey: originalHex as CssColor,
            darkKey: (darkKeyHex ?? originalHex) as CssColor,
        };
    } else {
        const lighterKeyOklch: OklchColor = {
            ...brandColorOklch,
            mode: 'oklch',
            l: Math.min(
                brandColorOklch.l / ADAPTIVE_COLOR_GENERATION.DARK_LIGHTNESS_FACTOR,
                ADAPTIVE_COLOR_GENERATION.LIGHT_LIGHTNESS_FACTOR,
            ),
            c: brandColorOklch.c * ADAPTIVE_COLOR_GENERATION.CHROMA_REDUCTION_FACTOR,
        };

        const lightKeyHex = formatHex(lighterKeyOklch);
        return {
            lightKey: (lightKeyHex ?? originalHex) as CssColor,
            darkKey: originalHex as CssColor,
        };
    }
};

/**
 * Adobe Leonardo Color 정의 객체를 생성합니다.
 * 브랜드 컬러를 기반으로 adaptive light/dark key pair를 생성하여 Leonardo Color 객체를 만듭니다.
 *
 * @param name - 색상 이름
 * @param colorHex - HEX 색상 값
 * @param contrastRatios - 대비 비율 설정
 * @returns Adobe Leonardo Color 객체 또는 null (유효하지 않은 색상인 경우)
 *
 * @example createColorDefinition({ name: 'blue', colorHex: '#448EFE', contrastRatios: { '050': 1.15, '100': 1.3 } })
 *
 * returns: Color {
 *   name: 'blue',
 *   colorKeys: ['#448EFE', '#2563EB'],
 *   colorspace: 'OKLCH',
 *   ratios: { '050': 1.15, '100': 1.3 }
 * }
 */
const createColorDefinition = ({
    name,
    colorHex,
    contrastRatios,
}: {
    name: string;
    colorHex: string;
    contrastRatios: Record<string, number>;
}): Color | null => {
    const brandColorOklch = oklch(colorHex);
    if (!brandColorOklch) {
        console.warn(`Invalid brand color: ${name} - ${colorHex}. Skipping.`);
        return null;
    }

    const { lightKey, darkKey } = createAdaptiveColorKeys(brandColorOklch, colorHex);

    return new Color({
        name,
        colorKeys: [lightKey, darkKey],
        colorspace: 'OKLCH',
        ratios: contrastRatios,
    });
};

/**
 * Adobe Leonardo Theme 객체를 생성합니다.
 *
 * @param colorDefinitions - Leonardo 색상 정의 배열
 * @param backgroundColor - 배경색
 * @param backgroundName - 배경색 이름
 * @param lightness - 테마의 명도 값
 * @param contrastRatios - 대비 비율
 * @returns Adobe Leonardo Theme 객체
 *
 * @example createLeonardoTheme({ colorDefinitions: [colorObj], backgroundColor: '#ffffff', backgroundName: 'canvas', lightness: 90, contrastRatios: { '050': 1.15 } })
 *
 * returns: Theme {
 *   colors: [...],
 *   backgroundColor: BackgroundColor,
 *   lightness: 90,
 *   output: 'HEX'
 * }
 */
const createLeonardoTheme = ({
    colorDefinitions,
    backgroundColor,
    backgroundName,
    lightness,
    contrastRatios,
}: {
    colorDefinitions: Color[];
    backgroundColor: Background['color'];
    backgroundName: Background['name'];
    lightness: number;
    contrastRatios: ContrastRatios;
}): Theme => {
    const backgroundColorObj = new BackgroundColor({
        name: backgroundName,
        colorKeys: [backgroundColor as CssColor],
        ratios: contrastRatios,
    });

    return new Theme({
        colors: [...colorDefinitions, backgroundColorObj],
        backgroundColor: backgroundColorObj,
        lightness,
        output: 'HEX',
    });
};

/**
 * Adobe Leonardo를 사용하여 테마별 컬러 토큰을 생성합니다.
 * 직접 TokenContainer 형태로 반환하여 변환 과정 없이 일관된 구조를 제공합니다.
 *
 * @param config - 토큰 생성 설정 객체
 * @param config.colors - 색상 이름과 HEX 값의 매핑
 * @param config.contrastRatios - 대비 비율 설정
 * @param config.backgroundColor - 배경색
 * @param config.backgroundName - 배경색 이름
 * @param config.lightness - 테마의 명도 값
 * @returns 생성된 컬러 토큰 객체
 *
 * @example generateThemeTokens({ colors: { blue: '#448EFE' }, contrastRatios: { '050': 1.15, '100': 1.3 }, backgroundColor: '#ffffff', backgroundName: 'canvas', lightness: 90 })
 *
 * returns: {
 *   'vapor-color-blue-050': { name: '...', hex: '...', oklch: '...', deltaE: 0, codeSyntax: '...' },
 *   'vapor-color-background-canvas': { name: '...', hex: '#ffffff', oklch: '...', codeSyntax: '...' }
 * }
 */
const generateThemeTokens = ({
    colors,
    contrastRatios,
    backgroundColor,
    backgroundName,
    lightness,
}: {
    colors: Colors;
    contrastRatios: ContrastRatios;
    backgroundColor: Background['color'];
    backgroundName: Background['name'];
    lightness: number;
}): Tokens => {
    const colorDefinitions = Object.entries(colors)
        .map(([name, hex]) => createColorDefinition({ name, colorHex: hex, contrastRatios }))
        .filter((def): def is Color => def !== null);

    const theme = createLeonardoTheme({
        colorDefinitions,
        backgroundColor,
        backgroundName,
        lightness,
        contrastRatios,
    });
    const [backgroundObj, ...themeColors] = theme.contrastColors;

    const calculateDeltaE = differenceCiede2000();
    const tokens: Record<string, ColorToken> = {};

    // Background canvas token 처리
    if ('background' in backgroundObj) {
        const oklchColor = oklch(backgroundObj.background);
        const oklchValue = formatCss(oklchColor);

        if (oklchValue) {
            const canvasToken: ColorToken = {
                name: generateTokenName(['background', 'canvas']),
                hex: backgroundObj.background,
                oklch: formatOklchForWeb(oklchValue),
                codeSyntax: generateCodeSyntax(['background', 'canvas']),
            };
            tokens[canvasToken.name!] = canvasToken;
        }
    }

    // 색상 팔레트 토큰들 처리
    themeColors.forEach((color) => {
        if ('name' in color && 'values' in color && color.values.length > 0) {
            const colorName = color.name;
            const originalColorHex = colors[colorName];

            const shadeData: Array<{
                name: string;
                hex: string;
                oklch: string;
                deltaE: number;
                tokenName: string;
                codeSyntax: string;
            }> = [];

            color.values.forEach((instance) => {
                const oklchColor = oklch(instance.value);
                const oklchValue = formatCss(oklchColor);

                if (oklchValue) {
                    let deltaE: number | undefined = undefined;
                    if (originalColorHex) {
                        deltaE =
                            Math.round(calculateDeltaE(originalColorHex, instance.value) * 100) /
                            100;
                    }

                    shadeData.push({
                        name: instance.name,
                        hex: instance.value,
                        oklch: formatOklchForWeb(oklchValue),
                        deltaE: deltaE || 0,
                        tokenName: generateTokenName([colorName, instance.name]),
                        codeSyntax: generateCodeSyntax([colorName, instance.name]),
                    });
                }
            });

            // 숫자 순으로 정렬
            shadeData.sort((a, b) => {
                const numA = parseInt(a.name, 10);
                const numB = parseInt(b.name, 10);
                return numA - numB;
            });

            // 토큰 객체에 추가
            shadeData.forEach((shade) => {
                const token: ColorToken = {
                    name: shade.tokenName,
                    hex: shade.hex,
                    oklch: shade.oklch,
                    deltaE: shade.deltaE,
                    codeSyntax: shade.codeSyntax,
                };
                tokens[shade.tokenName] = token;
            });
        }
    });

    return tokens;
};

export { generateThemeTokens };
