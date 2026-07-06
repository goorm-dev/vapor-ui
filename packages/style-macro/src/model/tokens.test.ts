import { describe, expect, it } from 'vitest';

import { resolveToken } from './tokens';
import type { ManifestShape } from './types';

const manifest: ManifestShape = {
    version: '1',
    tokens: {
        color: { primary: '--vapor-color-primary' },
        space: { '400': '--vapor-size-space-400' },
        dimension: {},
        borderRadius: {},
        shadow: {},
        typography: {},
    },
    propertyScopes: {
        padding: 'space',
        color: 'color',
    },
};

describe('resolveToken', () => {
    it('returns css var for valid token', () => {
        expect(resolveToken(manifest, 'padding', '400')).toEqual({
            cssVar: '--vapor-size-space-400',
        });
    });

    it('rejects scope mismatch', () => {
        expect(resolveToken(manifest, 'padding', 'primary')).toEqual({ error: 'scope-mismatch' });
    });

    it('rejects unknown token within scope', () => {
        expect(resolveToken(manifest, 'padding', '9999')).toEqual({ error: 'unknown-token' });
    });

    it('rejects unknown property', () => {
        expect(resolveToken(manifest, 'noSuchProp', '400')).toEqual({ error: 'unknown-property' });
    });
});
