// ============================================================================
// Color Conversion
// ============================================================================

/**
 * HEX 색상을 RGB 값으로 변환
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : { r: 0, g: 0, b: 0 };
}

/**
 * RGB 값을 Figma 색상 포맷(0-1 범위)으로 변환
 */
export function rgbToFigmaColor(
    r: number,
    g: number,
    b: number,
): { r: number; g: number; b: number } {
    return {
        r: r / 255,
        g: g / 255,
        b: b / 255,
    };
}

/**
 * HEX 색상을 Figma 색상 포맷으로 직접 변환
 */
export function hexToFigmaColor(hex: string): { r: number; g: number; b: number } {
    const { r, g, b } = hexToRgb(hex);
    return rgbToFigmaColor(r, g, b);
}

// ============================================================================
// Color Name Formatting
// ============================================================================

/**
 * 컬러 이름 포맷팅 (예: '050' -> '50')
 */
export function formatColorName(colorName: string): string {
    return colorName.replace(/\b0(\d+)\b/g, '$1');
}

/**
 * 패밀리 이름 포맷팅 (첫 글자 대문자)
 */
export function formatFamilyTitle(familyName: string): string {
    return familyName.charAt(0).toUpperCase() + familyName.slice(1);
}

// ============================================================================
// Color Data Processing
// ============================================================================

/**
 * 컬러 쉐이드 정렬 (숫자 순서대로)
 */
export function sortColorShades(shades: Record<string, unknown>): Array<[string, unknown]> {
    return Object.entries(shades).sort(([a], [b]) => {
        const numA = parseInt(a, 10);
        const numB = parseInt(b, 10);
        return numA - numB;
    });
}

// ============================================================================
// Validation
// ============================================================================

/**
 * 유효한 HEX 색상인지 확인
 */
export function isValidHexColor(hex: string): boolean {
    return /^#?([a-f\d]{6}|[a-f\d]{3})$/i.test(hex);
}

/**
 * 색상 데이터 유효성 검증
 */
export function isValidColorData(
    colorData: unknown,
): colorData is { hex: string; oklch?: string; codeSyntax?: string } {
    return (
        typeof colorData === 'object' &&
        colorData !== null &&
        'hex' in colorData &&
        typeof colorData.hex === 'string' &&
        isValidHexColor(colorData.hex)
    );
}
