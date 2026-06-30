import { describe, expect, it } from 'vitest';

import { loadDimensionSchemas } from '~/ui/lib/loaders/dimension';

describe('loadDimensionSchemas', () => {
    const schemas = loadDimensionSchemas();

    it('space tokens 의 valueToTokens 인덱스가 빈 배열을 만들지 않는다', () => {
        for (const [value, tokens] of schemas.space.valueToTokens.entries()) {
            expect(value).toMatch(/^[\d.]+(px|rem|%)?$/);
            expect(tokens.length).toBeGreaterThanOrEqual(1);
        }
    });

    it('dimension, borderRadius, shadow 모두 동일한 인터페이스를 갖는다', () => {
        for (const key of ['space', 'dimension', 'borderRadius', 'shadow'] as const) {
            expect(schemas[key].tokens).toBeTypeOf('object');
            expect(schemas[key].valueToTokens).toBeInstanceOf(Map);
        }
    });

    it('각 카테고리가 최소 1개 이상의 토큰을 포함한다', () => {
        expect(Object.keys(schemas.space.tokens).length).toBeGreaterThan(0);
        expect(Object.keys(schemas.dimension.tokens).length).toBeGreaterThan(0);
        expect(Object.keys(schemas.borderRadius.tokens).length).toBeGreaterThan(0);
        expect(Object.keys(schemas.shadow.tokens).length).toBeGreaterThan(0);
    });
});
