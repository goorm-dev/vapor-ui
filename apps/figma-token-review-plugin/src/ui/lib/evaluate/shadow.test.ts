import { describe, expect, it } from 'vitest';

import type { ShadowUsage } from '~/common/schemas';
import { evaluateShadow } from '~/ui/lib/evaluate/shadow';
import { loadDimensionSchemas } from '~/ui/lib/loaders/dimension';

const schemas = loadDimensionSchemas();

function usage(partial: Partial<ShadowUsage>): ShadowUsage {
    return {
        nodeId: 'n',
        name: 'card',
        value: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
        token: null,
        tokenStatus: 'ok',
        ...partial,
    };
}

describe('evaluateShadow', () => {
    it('raw 는 token-not-used', () => {
        const r = evaluateShadow([usage({ tokenStatus: 'raw' })], schemas.shadow);
        expect(r.violations[0].type).toBe('token-not-used');
    });

    it('raw severity 는 high', () => {
        const r = evaluateShadow([usage({ tokenStatus: 'raw' })], schemas.shadow);
        expect(r.violations[0].severity).toBe('high');
    });

    it('스키마에 없는 토큰은 unknown-token', () => {
        const r = evaluateShadow(
            [usage({ token: 'shadow.999', tokenStatus: 'ok' })],
            schemas.shadow,
        );
        expect(r.violations[0].type).toBe('unknown-token');
    });

    it('적합 토큰은 conformant', () => {
        const k = Object.keys(schemas.shadow.tokens)[0];
        const v = schemas.shadow.tokens[k];
        const r = evaluateShadow([usage({ token: k, value: v })], schemas.shadow);
        expect(r.violations.length).toBe(0);
        expect(r.conformant.length).toBe(1);
        expect(r.conformant[0].token).toBe(k);
    });

    it('property 는 shadow (camelCase)', () => {
        const r = evaluateShadow([usage({ tokenStatus: 'raw' })], schemas.shadow);
        expect(r.violations[0].property).toBe('shadow');
    });

    it('token null + tokenStatus ok → unknown-token', () => {
        const r = evaluateShadow([usage({ token: null, tokenStatus: 'ok' })], schemas.shadow);
        expect(r.violations[0].type).toBe('unknown-token');
    });
});
