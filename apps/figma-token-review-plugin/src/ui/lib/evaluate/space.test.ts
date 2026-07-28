import { describe, expect, it } from 'vitest';

import type { SpaceUsage } from '~/common/schemas';
import { evaluateSpace } from '~/ui/lib/evaluate/space';
import { loadDimensionSchemas } from '~/ui/lib/loaders/dimension';

const schemas = loadDimensionSchemas();

function usage(partial: Partial<SpaceUsage>): SpaceUsage {
    return {
        nodeId: 'n',
        name: 'box',
        property: 'padding',
        value: '16px',
        token: null,
        tokenStatus: 'ok',
        ...partial,
    };
}

describe('evaluateSpace', () => {
    it('raw value 는 token-not-used / high', () => {
        const r = evaluateSpace([usage({ tokenStatus: 'raw' })], schemas.space);
        expect(r.violations[0].type).toBe('token-not-used');
        expect(r.violations[0].severity).toBe('high');
    });

    it('스키마에 없는 토큰은 unknown-token', () => {
        const r = evaluateSpace([usage({ token: 'space.999', tokenStatus: 'ok' })], schemas.space);
        expect(r.violations[0].type).toBe('unknown-token');
    });

    it('적합 토큰은 conformant', () => {
        const knownToken = Object.keys(schemas.space.tokens)[0];
        const knownValue = schemas.space.tokens[knownToken];
        const r = evaluateSpace([usage({ token: knownToken, value: knownValue })], schemas.space);
        expect(r.violations.length).toBe(0);
        expect(r.conformant[0].token).toBe(knownToken);
    });

    it(
        'Variable Mode wrap 이 semantic 이면 (token=semantic, appliedToken=outer) conformant, ' +
            'conformant.token 은 semantic 유지',
        () => {
            const knownToken = Object.keys(schemas.space.tokens)[0];
            const knownValue = schemas.space.tokens[knownToken];
            const r = evaluateSpace(
                [
                    usage({
                        token: knownToken,
                        appliedToken: 'space-inline',
                        value: knownValue,
                    }),
                ],
                schemas.space,
            );
            expect(r.violations.length).toBe(0);
            expect(r.conformant[0].token).toBe(knownToken);
        },
    );

    it('스키마에 없는 wrap 은 unknown-token 위반, violation.token 은 appliedToken(outer) 표시', () => {
        const r = evaluateSpace(
            [
                usage({
                    token: 'space-inline',
                    appliedToken: 'space-inline',
                    tokenStatus: 'ok',
                }),
            ],
            schemas.space,
        );
        expect(r.violations[0].type).toBe('unknown-token');
        expect(r.violations[0].token).toBe('space-inline');
    });

    it('token-not-used 위반은 raw value → violation.token=null (appliedToken 무시)', () => {
        const r = evaluateSpace([usage({ tokenStatus: 'raw', appliedToken: null })], schemas.space);
        expect(r.violations[0].type).toBe('token-not-used');
        expect(r.violations[0].token).toBeNull();
    });
});
