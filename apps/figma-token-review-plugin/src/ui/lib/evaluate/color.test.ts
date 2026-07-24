import { describe, expect, it } from 'vitest';

import type { ColorUsage } from '~/common/schemas';
import { evaluateColor } from '~/ui/lib/evaluate/color';
import { loadColorSchema } from '~/ui/lib/loaders/color';

const schema = loadColorSchema('light');

function usage(partial: Partial<ColorUsage>): ColorUsage {
    return {
        nodeId: 'n',
        name: 'sample',
        property: 'fill',
        token: null,
        hex: null,
        tokenStatus: 'ok',
        background: null,
        ...partial,
    };
}

describe('evaluateColor', () => {
    it('raw fill 은 token-not-used / severity high 로 잡는다', () => {
        const result = evaluateColor(
            [usage({ tokenStatus: 'raw', hex: '#ff0000', token: null })],
            schema,
        );
        expect(result.violations[0].type).toBe('token-not-used');
        expect(result.violations[0].severity).toBe('high');
    });

    it('알 수 없는 토큰은 unknown-token', () => {
        const result = evaluateColor(
            [usage({ tokenStatus: 'unknown', token: null, hex: '#abc123' })],
            schema,
        );
        expect(result.violations[0].type).toBe('unknown-token');
    });

    it('do-not-use 플래그가 박힌 토큰은 do-not-use 로 잡는다', () => {
        // status=do-not-use 가 있는 token 키를 schema 에서 골라 입력
        const doNotUseKey = Object.entries(schema.semantic).find(
            ([, v]) => v.status === 'do-not-use',
        )?.[0];
        if (!doNotUseKey) return; // 스키마에 없으면 skip
        const result = evaluateColor(
            [
                usage({
                    tokenStatus: 'ok',
                    token: doNotUseKey,
                    hex: schema.semantic[doNotUseKey].hex,
                }),
            ],
            schema,
        );
        expect(result.violations[0].type).toBe('do-not-use');
    });

    it('fill 에 foreground 토큰을 쓰면 role-mismatch', () => {
        const fgKey = Object.entries(schema.semantic).find(([, v]) => v.role === 'foreground')?.[0];
        if (!fgKey) return;
        const result = evaluateColor(
            [
                usage({
                    property: 'fill',
                    tokenStatus: 'ok',
                    token: fgKey,
                    hex: schema.semantic[fgKey].hex,
                }),
            ],
            schema,
        );
        expect(result.violations.some((v) => v.type === 'role-mismatch')).toBe(true);
    });

    it('primitive 토큰 사용은 warning 으로 잡지 않고 conformant 처리', () => {
        const result = evaluateColor(
            [usage({ tokenStatus: 'ok', token: 'color-blue-500', hex: '#0000ff' })],
            schema,
        );
        expect(result.violations).toHaveLength(0);
        expect(result.conformant.some((c) => c.token === 'color-blue-500')).toBe(true);
    });

    it('grade 없는 primitive(color-white, color-black)도 conformant 로 통과', () => {
        for (const token of ['color-white', 'color-black']) {
            const result = evaluateColor(
                [
                    usage({
                        tokenStatus: 'ok',
                        token,
                        hex: schema.primitive[token],
                    }),
                ],
                schema,
            );
            expect(result.violations).toHaveLength(0);
            expect(result.conformant.some((c) => c.token === token)).toBe(true);
        }
    });

    it('fg-200 을 순백 배경 위에 쓰면 fg-grade-mismatch', () => {
        const key = Object.entries(schema.semantic).find(
            ([k, v]) =>
                v.role === 'foreground' && v.gradeRule?.other === '200' && k.endsWith('-200'),
        )?.[0];
        if (!key) return;
        const result = evaluateColor(
            [
                usage({
                    property: 'text',
                    tokenStatus: 'ok',
                    token: key,
                    hex: schema.semantic[key].hex,
                    background: { kind: 'white', hex: '#ffffff' },
                }),
            ],
            schema,
        );
        expect(result.violations.some((v) => v.type === 'fg-grade-mismatch')).toBe(true);
    });

    it('fg-200 을 투명 배경 위에 쓰면 fg-grade-mismatch', () => {
        const key = Object.entries(schema.semantic).find(
            ([k, v]) =>
                v.role === 'foreground' && v.gradeRule?.other === '200' && k.endsWith('-200'),
        )?.[0];
        if (!key) return;
        const result = evaluateColor(
            [
                usage({
                    property: 'text',
                    tokenStatus: 'ok',
                    token: key,
                    hex: schema.semantic[key].hex,
                    background: { kind: 'transparent', hex: null },
                }),
            ],
            schema,
        );
        expect(result.violations.some((v) => v.type === 'fg-grade-mismatch')).toBe(true);
    });

    it('fg-100 을 순백 배경 위에 쓰면 문제 없음', () => {
        const key = Object.entries(schema.semantic).find(
            ([k, v]) =>
                v.role === 'foreground' && v.gradeRule?.other === '100' && k.endsWith('-100'),
        )?.[0];
        if (!key) return;
        const result = evaluateColor(
            [
                usage({
                    property: 'text',
                    tokenStatus: 'ok',
                    token: key,
                    hex: schema.semantic[key].hex,
                    background: { kind: 'white', hex: '#ffffff' },
                }),
            ],
            schema,
        );
        expect(result.violations.length).toBe(0);
    });

    it('적합한 semantic 토큰 사용은 conformant 로 떨어진다', () => {
        const fgKey = Object.entries(schema.semantic).find(([, v]) => v.role === 'foreground')?.[0];
        if (!fgKey) return;
        const result = evaluateColor(
            [
                usage({
                    // 'text' property → effectiveProperty maps to 'fill-on-text'
                    // foreground role is allowed for fill-on-text per PROPERTY_SCOPE
                    property: 'text',
                    tokenStatus: 'ok',
                    token: fgKey,
                    hex: schema.semantic[fgKey].hex,
                }),
            ],
            schema,
        );
        expect(result.violations.length).toBe(0);
        expect(result.conformant.length).toBe(1);
    });
});
