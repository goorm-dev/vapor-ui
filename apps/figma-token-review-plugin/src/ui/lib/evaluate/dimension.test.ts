import { describe, expect, it } from 'vitest';

import type { DimensionUsage } from '~/common/schemas';
import { evaluateDimension } from '~/ui/lib/evaluate/dimension';
import { loadDimensionSchemas } from '~/ui/lib/loaders/dimension';

const schemas = loadDimensionSchemas();

function usage(partial: Partial<DimensionUsage>): DimensionUsage {
    return {
        nodeId: 'n',
        name: 'box',
        property: 'width',
        value: '320px',
        token: null,
        tokenStatus: 'ok',
        ...partial,
    };
}

describe('evaluateDimension', () => {
    it('raw value 는 token-not-used / high', () => {
        const r = evaluateDimension([usage({ tokenStatus: 'raw' })], schemas.dimension);
        expect(r.violations[0].type).toBe('token-not-used');
        expect(r.violations[0].severity).toBe('high');
    });

    it('스키마에 없는 토큰은 unknown-token', () => {
        const r = evaluateDimension(
            [usage({ token: 'dimension.999', tokenStatus: 'ok' })],
            schemas.dimension,
        );
        expect(r.violations[0].type).toBe('unknown-token');
    });

    it('적합 토큰은 conformant', () => {
        const k = Object.keys(schemas.dimension.tokens)[0];
        const v = schemas.dimension.tokens[k];
        const r = evaluateDimension([usage({ token: k, value: v })], schemas.dimension);
        expect(r.violations.length).toBe(0);
        expect(r.conformant.length).toBe(1);
        expect(r.conformant[0].token).toBe(k);
    });
});
