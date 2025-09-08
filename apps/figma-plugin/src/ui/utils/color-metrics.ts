import type { ColorPaletteCollection } from '@vapor-ui/color-generator';

export interface PerceptualUniformityMetrics {
    uniformity: string;
    lightnessRange: {
        min: string;
        max: string;
    };
}

/**
 * 생성된 컬러 팔레트의 인지적 균일성(Perceptual Uniformity) 메트릭을 계산합니다.
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
 * @param palette 생성된 컬러 팔레트 컬렉션
 * @returns 균일성 메트릭 또는 계산 실패시 null
 */
export const calculatePerceptualUniformity = (
    palette: ColorPaletteCollection,
): PerceptualUniformityMetrics | null => {
    const lightColors = palette.light;
    const colorEntries = Object.entries(lightColors).filter(([key]) => key !== 'background');

    if (colorEntries.length === 0) return null;

    const allShades: { hex: string; oklch: string }[] = [];
    colorEntries.forEach(([, colorObj]) => {
        if (typeof colorObj === 'object' && colorObj !== null) {
            Object.values(colorObj).forEach((shade) => {
                if (typeof shade === 'object' && shade !== null && 'oklch' in shade) {
                    allShades.push(shade as { hex: string; oklch: string });
                }
            });
        }
    });

    if (allShades.length === 0) return null;

    const lightnessValues = allShades.map((shade) => {
        const oklch = shade.oklch.match(/oklch\((\d+\.?\d*)/);
        return oklch ? parseFloat(oklch[1]) : 0;
    });

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
