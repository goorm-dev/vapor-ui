/**
 * Whether `hex` is `#RGB` or `#RRGGBB`.
 */
export function isValidHexColor(hex: string): boolean {
    return /^#([0-9A-Fa-f]{3}){1,2}$/.test(hex);
}

/**
 * Whether `name` works as a palette name in token names.
 */
export function isValidColorName(name: string): boolean {
    return /^[a-z]+[a-z0-9-]*$/i.test(name);
}

/**
 * `#abc` / `#AABBCC` → `AABBCC`, the engine's HEX form. Throws on anything else.
 */
export function toRawHex(hex: string): string {
    if (!isValidHexColor(hex)) throw new Error(`Invalid hex color: ${hex}`);
    const h = hex.slice(1).toUpperCase();
    return h.length === 3 ? h.replace(/./g, '$&$&') : h;
}
