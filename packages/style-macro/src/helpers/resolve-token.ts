import { propertyToTokenAxis, tokens } from '~/tokens';

/** `$` 접두 토큰을 CSS var 로 해석. 토큰이 아니면 값 그대로 통과. */
export function _resolveToken(property: string, value: unknown) {
    if (typeof value !== 'string') return value;
    if (!value.startsWith('$')) return value;

    const tokenKey = value.slice(1);
    const camel = kebabToCamel(property);
    const axis = (propertyToTokenAxis as Record<string, string>)[camel];
    if (!axis) return tokenKey;

    const axisTable = (tokens as Record<string, Record<string, string>>)[axis];
    if (!axisTable) return tokenKey;

    const resolved = axisTable[tokenKey];
    return resolved !== undefined ? resolved : tokenKey;
}

function kebabToCamel(s: string) {
    return s.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}
