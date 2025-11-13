/**
 * Typography Style Mapping
 *
 * Figma 텍스트 스타일을 Vapor UI Typography 스타일로 매핑
 */

/**
 * Typography 스타일 정의
 * packages/core/src/styles/mixins/typography.css.ts와 동기화
 */
export const TYPOGRAPHY_STYLES = {
    display1: { fontSize: 120, fontWeight: 800, lineHeight: 156 },
    display2: { fontSize: 80, fontWeight: 800, lineHeight: 104 },
    display3: { fontSize: 64, fontWeight: 800, lineHeight: 84 },
    display4: { fontSize: 48, fontWeight: 800, lineHeight: 62 },
    heading1: { fontSize: 38, fontWeight: 700, lineHeight: 56 },
    heading2: { fontSize: 32, fontWeight: 700, lineHeight: 48 },
    heading3: { fontSize: 24, fontWeight: 700, lineHeight: 36 },
    heading4: { fontSize: 20, fontWeight: 700, lineHeight: 30 },
    heading5: { fontSize: 18, fontWeight: 700, lineHeight: 26 },
    heading6: { fontSize: 16, fontWeight: 500, lineHeight: 24 },
    subtitle1: { fontSize: 14, fontWeight: 500, lineHeight: 22 },
    subtitle2: { fontSize: 12, fontWeight: 500, lineHeight: 18 },
    body1: { fontSize: 16, fontWeight: 400, lineHeight: 24 },
    body2: { fontSize: 14, fontWeight: 400, lineHeight: 22 },
    body3: { fontSize: 12, fontWeight: 400, lineHeight: 18 },
    body4: { fontSize: 10, fontWeight: 400, lineHeight: 14 },
    code1: { fontSize: 14, fontWeight: 400, lineHeight: 22 },
    code2: { fontSize: 12, fontWeight: 400, lineHeight: 18 },
} as const;

export type TypographyStyleName = keyof typeof TYPOGRAPHY_STYLES;

/**
 * Figma 텍스트 스타일을 Typography 스타일로 매핑
 *
 * @param fontSize - 폰트 크기 (px)
 * @param fontWeight - 폰트 굵기
 * @param lineHeight - 줄 높이 (px)
 * @returns Typography 스타일 이름 또는 null
 */
export function mapToTypographyStyle(
    fontSize: number,
    fontWeight: number,
    lineHeight: number,
): TypographyStyleName | null {
    // 정확히 일치하는 스타일 찾기
    for (const [styleName, style] of Object.entries(TYPOGRAPHY_STYLES)) {
        if (
            Math.abs(style.fontSize - fontSize) < 0.5 &&
            style.fontWeight === fontWeight &&
            Math.abs(style.lineHeight - lineHeight) < 0.5
        ) {
            return styleName as TypographyStyleName;
        }
    }

    return null;
}

/**
 * Typography 스타일 우선순위 (fontSize와 fontWeight만 고려)
 *
 * lineHeight가 다를 때 fallback으로 사용
 */
export function mapToTypographyStyleLoose(
    fontSize: number,
    fontWeight: number,
): TypographyStyleName | null {
    // fontSize와 fontWeight만 일치하는 스타일 찾기
    for (const [styleName, style] of Object.entries(TYPOGRAPHY_STYLES)) {
        if (Math.abs(style.fontSize - fontSize) < 0.5 && style.fontWeight === fontWeight) {
            return styleName as TypographyStyleName;
        }
    }

    return null;
}
