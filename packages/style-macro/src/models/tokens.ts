import { propertyToTokenAxis, tokens } from '~/tokens';

export type ResolveResult =
    { cssVar: string } | { error: 'unknown-token' | 'scope-mismatch' | 'unknown-property' };

/**
 * `$token` 참조를 CSS var 표현으로 해석. 소스는 `~/tokens` 하드코딩 맵.
 * property는 camelCase 기준.
 */
export function resolveToken(property: string, tokenName: string): ResolveResult {
    const axis = (propertyToTokenAxis as Record<string, string>)[property];
    if (!axis) return { error: 'unknown-property' };

    const bucket = (tokens as Record<string, Record<string, string>>)[axis];
    const cssVar = bucket?.[tokenName];

    if (!cssVar) {
        for (const other of Object.keys(tokens)) {
            if (other === axis) continue;
            const otherBucket = (tokens as Record<string, Record<string, string>>)[other];
            if (otherBucket[tokenName]) return { error: 'scope-mismatch' };
        }
        return { error: 'unknown-token' };
    }

    return { cssVar };
}
