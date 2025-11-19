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
