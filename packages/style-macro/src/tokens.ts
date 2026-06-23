import type { ManifestShape, TokenScope } from './types';

const SCOPES: TokenScope[] = [
    'color',
    'space',
    'dimension',
    'borderRadius',
    'shadow',
    'typography',
];

export type ResolveResult =
    | { cssVar: string }
    | { error: 'unknown-token' | 'scope-mismatch' | 'unknown-property' };

export function resolveToken(
    manifest: ManifestShape,
    property: string,
    tokenName: string,
): ResolveResult {
    const scope = manifest.propertyScopes[property];
    if (!scope) return { error: 'unknown-property' };
    const bucket = manifest.tokens[scope];
    const cssVar = bucket[tokenName];
    if (!cssVar) {
        for (const otherScope of SCOPES) {
            if (otherScope === scope) continue;
            if (manifest.tokens[otherScope][tokenName]) return { error: 'scope-mismatch' };
        }
        return { error: 'unknown-token' };
    }
    return { cssVar };
}
