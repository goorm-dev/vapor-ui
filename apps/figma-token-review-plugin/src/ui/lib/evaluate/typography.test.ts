import { describe, expect, it } from 'vitest';

import { loadTextStyleSchema } from '~/ui/lib/loaders/typography';
import { evaluateTypography } from '~/ui/lib/evaluate/typography';
import type { TypographyUsage } from '~/common/schemas';

const schema = loadTextStyleSchema();

function usage(partial: Partial<TypographyUsage>): TypographyUsage {
    return {
        nodeId: 'n',
        name: 'label',
        characters: '안내',
        textStyle: 'body2',
        viewport: 'pc',
        appliedStatus: 'styled-clean',
        overriddenFields: [],
        resolved: { fontSize: 14, lineHeight: {}, letterSpacing: {}, fontName: {} },
        ...partial,
    };
}

describe('evaluateTypography', () => {
    it('appliedStatus=raw 는 typo-raw / high', () => {
        const r = evaluateTypography([usage({ appliedStatus: 'raw', textStyle: null })], schema);
        expect(r.violations[0].type).toBe('typo-raw');
        expect(r.violations[0].severity).toBe('high');
    });

    it('styled-override 는 typo-styled-override / info', () => {
        const r = evaluateTypography(
            [usage({ appliedStatus: 'styled-override', overriddenFields: ['fontSize'] })],
            schema,
        );
        expect(r.violations[0].type).toBe('typo-styled-override');
        expect(r.violations[0].severity).toBe('info');
    });

    it('styled-override detail 에 overriddenFields 표시', () => {
        const r = evaluateTypography(
            [usage({ appliedStatus: 'styled-override', overriddenFields: ['fontSize', 'lineHeight'] })],
            schema,
        );
        expect(r.violations[0].detail).toContain('fontSize');
        expect(r.violations[0].detail).toContain('lineHeight');
    });

    it('styled-clean 은 conformant', () => {
        const r = evaluateTypography([usage({})], schema);
        expect(r.violations.length).toBe(0);
        expect(r.conformant.length).toBe(1);
    });

    it('스키마에 없는 textStyle → unknown-token / high', () => {
        const r = evaluateTypography([usage({ textStyle: 'nonexistent-style-xyz', appliedStatus: 'styled-clean' })], schema);
        expect(r.violations[0].type).toBe('unknown-token');
        expect(r.violations[0].severity).toBe('high');
    });

    it('property 는 textStyle', () => {
        const r = evaluateTypography([usage({ appliedStatus: 'raw', textStyle: null })], schema);
        expect(r.violations[0].property).toBe('textStyle');
    });

    it('suggested 는 항상 빈 배열', () => {
        const r = evaluateTypography([usage({ appliedStatus: 'raw', textStyle: null })], schema);
        expect(r.violations[0].suggested).toEqual([]);
    });

    it('token 필드는 textStyle 이름', () => {
        const r = evaluateTypography([usage({ appliedStatus: 'raw', textStyle: null })], schema);
        expect(r.violations[0].token).toBeNull();

        const r2 = evaluateTypography(
            [usage({ appliedStatus: 'styled-override', textStyle: 'body2', overriddenFields: ['fontSize'] })],
            schema,
        );
        expect(r2.violations[0].token).toBe('body2');
    });

    it('conformant token 필드는 textStyle 이름', () => {
        const r = evaluateTypography([usage({ textStyle: 'body2', appliedStatus: 'styled-clean' })], schema);
        expect(r.conformant[0].token).toBe('body2');
    });

    it('빈 usages → violations/conformant 모두 빔', () => {
        const r = evaluateTypography([], schema);
        expect(r.violations.length).toBe(0);
        expect(r.conformant.length).toBe(0);
    });
});
