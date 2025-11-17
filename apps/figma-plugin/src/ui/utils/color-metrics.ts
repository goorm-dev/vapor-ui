export interface PerceptualUniformityMetrics {
    uniformity: string;
    lightnessRange: {
        min: string;
        max: string;
    };
}

export interface ColorToken {
    hex: string;
    oklch: string;
}

/**
 * 색상 배열의 인지적 균일성(Perceptual Uniformity) 메트릭을 계산합니다.
 *
 * 이 함수는 컬러 shade들 간의 명도 분포를 분석하여 색상 단계가 얼마나
 * 인지적으로 균일한지를 측정합니다. 이는 디자인 시스템에서 일관된
 * 시각적 위계와 접근성을 달성하는데 중요합니다.
 *
 * 작동 원리:
 * - 각 색상의 OKLCH 명도값(L)을 추출
 * - 명도값들의 표준편차를 계산하여 균일성 평가
 * - 0-100 스케일로 점수화 (높을수록 더 균일함)
 *
 * @param colors 분석할 색상 토큰 배열
 * @returns 균일성 메트릭 또는 계산 실패시 null
 */
export const calculatePerceptualUniformity = (
    colors: ColorToken[],
): PerceptualUniformityMetrics | null => {
    if (colors.length === 0) return null;

    const lightnessValues = colors.map((color) => {
        const oklch = color.oklch.match(/oklch\((\d+\.?\d*)/);
        return oklch ? parseFloat(oklch[1]) : 0;
    });

    // 유효한 명도값이 없으면 null 반환
    if (lightnessValues.every((val) => val === 0)) return null;

    const mean = lightnessValues.reduce((a, b) => a + b, 0) / lightnessValues.length;
    const variance =
        lightnessValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / lightnessValues.length;

    const uniformity = Math.max(0, 100 - Math.sqrt(variance) * 10);

    return {
        uniformity: uniformity.toFixed(1),
        lightnessRange: {
            min: Math.min(...lightnessValues).toFixed(2),
            max: Math.max(...lightnessValues).toFixed(2),
        },
    };
};

interface PaletteThemeData {
    tokens: Record<string, unknown>;
}

interface PaletteStructure {
    light?: PaletteThemeData;
    dark?: PaletteThemeData;
    base?: PaletteThemeData;
}

/**
 * ColorPaletteResult에서 색상 토큰들을 추출하는 헬퍼 함수
 */
export const extractColorsFromPalette = (
    palette: PaletteStructure,
    options: {
        excludeBackgroundTokens?: boolean;
        theme?: 'light' | 'dark' | 'base';
    } = {},
): ColorToken[] => {
    const { excludeBackgroundTokens = true, theme = 'light' } = options;

    const themeData = palette[theme];
    if (!themeData?.tokens) return [];

    const colors: ColorToken[] = [];

    Object.entries(themeData.tokens).forEach(([tokenName, tokenValue]) => {
        // 배경 토큰 제외 옵션이 활성화된 경우
        if (excludeBackgroundTokens && tokenName.includes('background')) {
            return;
        }

        // ColorToken 형태의 객체인지 확인
        if (
            typeof tokenValue === 'object' &&
            tokenValue !== null &&
            'hex' in tokenValue &&
            'oklch' in tokenValue
        ) {
            const token = tokenValue as { hex: string; oklch: string };
            colors.push({
                hex: token.hex,
                oklch: token.oklch,
            });
        }
    });

    return colors;
};
