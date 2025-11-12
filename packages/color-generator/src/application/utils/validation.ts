/**
 * Lightness 값을 유효한 범위로 제한합니다.
 * 색역 클리핑 방지를 위한 검증 로직입니다.
 */
export function clampLightness(lightness: number, mode: 'light' | 'dark'): number {
    if (mode === 'light') {
        // Light 모드: 88 ~ 100 범위로 제한 (88 미만 시 900 단계가 #000으로 클리핑됨)
        return Math.max(88, Math.min(100, lightness));
    } else {
        // Dark 모드: 0 ~ 15 범위로 제한 (15 초과 시 900 단계가 #FFF으로 클리핑됨)
        return Math.max(0, Math.min(15, lightness));
    }
}

/**
 * HEX 색상 코드가 유효한지 검증합니다.
 */
export function isValidHexColor(hex: string): boolean {
    const hexPattern = /^#([0-9A-Fa-f]{3}){1,2}$/;
    return hexPattern.test(hex);
}

/**
 * 색상 이름이 유효한지 검증합니다.
 */
export function isValidColorName(name: string): boolean {
    return /^[a-z]+[a-z0-9-]*$/i.test(name) && name.length > 0;
}
