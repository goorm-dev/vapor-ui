import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const manifestPath = resolve(__dirname, '../dist/tokens.manifest.json');

describe('tokens.manifest.json', () => {
    it('exists after build', () => {
        expect(existsSync(manifestPath)).toBe(true);
    });

    it('matches ManifestShape', () => {
        const m = JSON.parse(readFileSync(manifestPath, 'utf-8'));
        expect(m.version).toBe('1');
        for (const scope of ['color', 'space', 'dimension', 'borderRadius', 'shadow', 'typography']) {
            expect(typeof m.tokens[scope]).toBe('object');
        }
        expect(m.propertyScopes.padding).toBe('space');
        expect(m.propertyScopes.backgroundColor).toBe('color');
    });

    it('exposes well-known tokens with --vapor- prefix', () => {
        const m = JSON.parse(readFileSync(manifestPath, 'utf-8'));
        expect(m.tokens.space['400']).toBe('--vapor-size-space-400');
        const spaceKeys = Object.keys(m.tokens.space);
        expect(spaceKeys.length).toBeGreaterThan(0);
        expect(m.tokens.space[spaceKeys[0]]).toMatch(/^--vapor-/);
    });
});
