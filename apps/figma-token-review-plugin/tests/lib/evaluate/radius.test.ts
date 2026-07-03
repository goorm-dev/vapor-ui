import { describe, expect, it } from 'vitest';

import { loadDimensionSchemas } from '~/ui/lib/loaders/dimension';
import { evaluateRadius } from '~/ui/lib/evaluate/radius';
import type { RadiusUsage } from '~/common/schemas';

const schemas = loadDimensionSchemas();

function usage(partial: Partial<RadiusUsage>): RadiusUsage {
    return { nodeId: 'n', name: 'card', value: '8px', token: null, tokenStatus: 'ok', ...partial };
}

describe('evaluateRadius', () => {
    it('raw value 는 token-not-used', () => {
        const r = evaluateRadius([usage({ tokenStatus: 'raw' })], schemas.borderRadius);
        expect(r.violations[0].type).toBe('token-not-used');
        expect(r.violations[0].severity).toBe('high');
    });

    it('스키마에 없는 토큰은 unknown-token', () => {
        const r = evaluateRadius([usage({ token: 'borderRadius.999', tokenStatus: 'ok' })], schemas.borderRadius);
        expect(r.violations[0].type).toBe('unknown-token');
    });

    it('적합 토큰은 conformant', () => {
        const k = Object.keys(schemas.borderRadius.tokens)[0];
        const v = schemas.borderRadius.tokens[k];
        const r = evaluateRadius([usage({ token: k, value: v })], schemas.borderRadius);
        expect(r.violations.length).toBe(0);
        expect(r.conformant.length).toBe(1);
        expect(r.conformant[0].token).toBe(k);
    });

    it('property 는 borderRadius (camelCase)', () => {
        const r = evaluateRadius([usage({ tokenStatus: 'raw' })], schemas.borderRadius);
        expect(r.violations[0].property).toBe('borderRadius');
    });

    it('token null + tokenStatus ok → unknown-token', () => {
        const r = evaluateRadius([usage({ token: null, tokenStatus: 'ok' })], schemas.borderRadius);
        expect(r.violations[0].type).toBe('unknown-token');
    });
});
