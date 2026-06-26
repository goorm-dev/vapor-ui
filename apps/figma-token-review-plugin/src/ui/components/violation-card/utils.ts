export const HEX_RE = /#[0-9a-fA-F]{3,8}/;

export function extractRawValue(detail: string): string | null {
    const m = detail.match(HEX_RE);
    return m ? m[0].toUpperCase() : null;
}

export function isHexColor(value: string): boolean {
    return HEX_RE.test(value);
}
