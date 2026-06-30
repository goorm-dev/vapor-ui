import { describe, expect, it } from 'vitest';

import { loadColorSchema } from '~/ui/lib/loaders/color';

describe('loadColorSchema(light)', () => {
    const schema = loadColorSchema('light');

    it('semantic 토큰을 평탄화한 키를 가진다', () => {
        expect(schema.tokenKeys.length).toBeGreaterThan(0);
        expect(schema.tokenKeys[0]).toMatch(/^color-/);
    });

    it('각 토큰 메타에 when, avoid 배열을 포함한다', () => {
        const sample = schema.semantic[schema.tokenKeys[0]];
        expect(Array.isArray(sample.when)).toBe(true);
        expect(Array.isArray(sample.avoid)).toBe(true);
    });

    it('hex index로 같은 색을 가진 모든 semantic 토큰을 역참조할 수 있다', () => {
        expect(schema.hexIndex.size).toBeGreaterThan(0);
        for (const [hex, tokens] of schema.hexIndex.entries()) {
            expect(hex).toMatch(/^#[0-9a-f]{6}$/i);
            expect(tokens.length).toBeGreaterThanOrEqual(1);
        }
    });

    it('oklch primitive white [1,0,0]은 #ffffff로 변환된다', () => {
        expect(schema.primitive['color-base-white']).toBe('#ffffff');
    });

    it('oklch primitive black [0,0,0]은 #000000으로 변환된다', () => {
        expect(schema.primitive['color-base-black']).toBe('#000000');
    });

    it('foreground 그룹의 leaf 토큰은 gradeRule을 상속한다', () => {
        const fg100 = schema.semantic['color-foreground-normal-100'];
        expect(fg100?.gradeRule).toBeTruthy();
    });
});
