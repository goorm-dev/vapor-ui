import { readFileSync } from 'node:fs';

import type { ManifestShape, TokenScope } from './types';

const SCOPES: TokenScope[] = ['color', 'space', 'dimension', 'borderRadius', 'shadow', 'typography'];

export function loadManifest(path: string): ManifestShape {
    let parsed: unknown;
    try {
        parsed = JSON.parse(readFileSync(path, 'utf-8'));
    } catch (err) {
        throw new Error(`Failed to read manifest at ${path}: ${(err as Error).message}`);
    }
    if (!isManifest(parsed)) {
        throw new Error(`Invalid token manifest shape at ${path}`);
    }
    return parsed;
}

function isManifest(value: unknown): value is ManifestShape {
    if (typeof value !== 'object' || value === null) return false;
    const v = value as Record<string, unknown>;
    if (v.version !== '1') return false;
    if (typeof v.tokens !== 'object' || v.tokens === null) return false;
    if (typeof v.propertyScopes !== 'object' || v.propertyScopes === null) return false;
    for (const scope of SCOPES) {
        if (typeof (v.tokens as Record<string, unknown>)[scope] !== 'object') return false;
    }
    return true;
}

export type ResolveResult = { cssVar: string } | { error: 'unknown-token' | 'scope-mismatch' | 'unknown-property' };

export function resolveToken(manifest: ManifestShape, property: string, tokenName: string): ResolveResult {
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
