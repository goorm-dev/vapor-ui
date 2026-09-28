import { describe, expect, it } from 'vitest';

import { TOKEN_INDEX } from './token-index';

describe('TOKEN_INDEX', () => {
    it('contains semantic foreground tokens', () => {
        expect(TOKEN_INDEX.canonicalTokens.has('--vapor-color-foreground-primary-100')).toBe(true);
    });
    it('contains primitive color tokens', () => {
        expect(TOKEN_INDEX.canonicalTokens.has('--vapor-color-blue-600')).toBe(true);
    });
    it('contains foundation size tokens', () => {
        expect(TOKEN_INDEX.canonicalTokens.has('--vapor-size-space-150')).toBe(true);
    });
    it('meta records scope and kind correctly', () => {
        const meta = TOKEN_INDEX.tokenMeta.get('--vapor-color-foreground-primary-100');
        expect(meta?.kind).toBe('semantic');
        expect(meta?.scope).toBe('foreground');
    });
    it('byPx looks up dimension tokens', () => {
        const names = TOKEN_INDEX.byPx.get(12);
        expect(names).toBeDefined();
        expect(
            names!.some(
                (n) => n === '--vapor-size-space-150' || n === '--vapor-size-dimension-150',
            ),
        ).toBe(true);
    });
    it('byHex looks up primitive color tokens', () => {
        // pick whichever hex maps to a known primitive; assert that at least one primitive matches the white token
        const whites = TOKEN_INDEX.byHex.get('#ffffff') ?? [];
        expect(whites.some((n) => TOKEN_INDEX.tokenMeta.get(n)?.kind === 'primitive')).toBe(true);
    });
    it('byHex only indexes light-mode values', () => {
        // Every name listed under a hex key must have that hex as its LIGHT value.
        // Dark values live in meta.hexDark only — indexing them would make rules
        // suggest tokens that render a different color in light mode.
        TOKEN_INDEX.byHex.forEach((names, hex) => {
            names.forEach((name) => {
                expect(TOKEN_INDEX.tokenMeta.get(name)?.hex, `${name} under ${hex}`).toBe(hex);
            });
        });
    });
    it('byHex does not contain dark-only hex keys', () => {
        // #242424 is the dark value of --vapor-color-background-canvas-100 and
        // is not any token's light value — it must not be in the index.
        expect(TOKEN_INDEX.byHex.has('#242424')).toBe(false);
    });
    it('meta still records dark hex separately', () => {
        const meta = TOKEN_INDEX.tokenMeta.get('--vapor-color-background-canvas-100');
        expect(meta?.hexDark).toBeDefined();
        expect(meta?.hex).not.toBe(meta?.hexDark);
    });
});
