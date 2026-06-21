import { describe, expect, it } from 'vitest';
import { loadManifest, resolveToken } from '../src/tokens';

const manifestPath = new URL('./fixtures/manifest.sample.json', import.meta.url).pathname;

describe('loadManifest', () => {
    it('reads + validates a valid manifest', () => {
        const m = loadManifest(manifestPath);
        expect(m.tokens.color['primary']).toBe('--vapor-color-primary');
    });

    it('throws on missing version', () => {
        const bad = new URL('./fixtures/manifest.bad.json', import.meta.url).pathname;
        expect(() => loadManifest(bad)).toThrow(/manifest/);
    });
});

describe('resolveToken', () => {
    it('returns css var for valid token', () => {
        const m = loadManifest(manifestPath);
        expect(resolveToken(m, 'padding', '400')).toEqual({ cssVar: '--vapor-size-space-400' });
    });

    it('rejects scope mismatch', () => {
        const m = loadManifest(manifestPath);
        expect(resolveToken(m, 'padding', 'primary')).toEqual({ error: 'scope-mismatch' });
    });

    it('rejects unknown token within scope', () => {
        const m = loadManifest(manifestPath);
        expect(resolveToken(m, 'padding', '9999')).toEqual({ error: 'unknown-token' });
    });

    it('rejects unknown property', () => {
        const m = loadManifest(manifestPath);
        expect(resolveToken(m, 'noSuchProp', '400')).toEqual({ error: 'unknown-property' });
    });
});
