import { describe, expect, it } from 'vitest';

import { buildClassName, generateArbitraryValueSelector } from './class-name';
import type { Tuple } from './types';

const t = (overrides: Partial<Tuple> = {}): Tuple => ({
    property: 'padding',
    value: 'var(--vapor-size-space-400)',
    rawValue: '$space-400',
    selectorContext: 'base',
    ...overrides,
});

describe('buildClassName — readable (dev)', () => {
    it('shape: vapor_<propSlug>_<valueSlug>_<tail>', () => {
        expect(buildClassName(t())).toMatch(/^vapor_padding_space-400_[0-9a-zA-Z_]+$/);
    });

    it('same tuple → same class', () => {
        expect(buildClassName(t())).toBe(buildClassName(t()));
    });

    it('token-shaped rawValue strips leading $', () => {
        const cls = buildClassName(
            t({
                property: 'background-color',
                value: 'var(--vapor-color-foreground-primary)',
                rawValue: '$fg-primary',
            }),
        );
        expect(cls).toMatch(/^vapor_background-color_fg-primary_[0-9a-zA-Z_]+$/);
    });

    it('distinct selectorContext → distinct tail', () => {
        const def = buildClassName(t());
        const hover = buildClassName(t({ selectorContext: ':hover' }));
        expect(def).not.toBe(hover);
    });

    it('distinct cssValue → distinct tail', () => {
        const a = buildClassName(t({ value: 'var(--a)' }));
        const b = buildClassName(t({ value: 'var(--b)' }));
        expect(a).not.toBe(b);
    });

    it('slug escapes special chars (# → x, . → d, etc.)', () => {
        const cls = buildClassName(t({ property: 'color', value: '#ff0000', rawValue: '#ff0000' }));
        expect(cls).toMatch(/^vapor_color_xff0000_[0-9a-zA-Z_]+$/);
    });
});

describe('buildClassName — hashed (prod)', () => {
    it('shape: _<hash> (base62)', () => {
        expect(buildClassName(t(), 'hashed')).toMatch(/^_[0-9a-zA-Z_]+$/);
    });

    it('same tuple → same class', () => {
        expect(buildClassName(t(), 'hashed')).toBe(buildClassName(t(), 'hashed'));
    });

    it('distinct property → distinct class', () => {
        const a = buildClassName(t({ property: 'padding' }), 'hashed');
        const b = buildClassName(t({ property: 'margin' }), 'hashed');
        expect(a).not.toBe(b);
    });

    it('distinct selectorContext → distinct class', () => {
        const def = buildClassName(t(), 'hashed');
        const hover = buildClassName(t({ selectorContext: ':hover' }), 'hashed');
        const media = buildClassName(t({ selectorContext: '@media(min-width:768px)' }), 'hashed');
        expect(new Set([def, hover, media]).size).toBe(3);
    });

    it('distinct cssValue → distinct class', () => {
        const a = buildClassName(t({ value: 'var(--a)' }), 'hashed');
        const b = buildClassName(t({ value: 'var(--b)' }), 'hashed');
        expect(a).not.toBe(b);
    });

    // Regression: djb2 가 hex 값끼리 자연 충돌하던 쌍을 murmur2 는 분리한다.
    // MaxLee-dev PR 752 리뷰에서 production hashed mode 가 두 색을 같은 class
    // 로 묶어 스타일이 깨진다는 지적.
    it('separates djb2-natural hex collisions (#1E1E1E vs #0f0f0f)', () => {
        const a = buildClassName(
            t({
                property: 'backgroundColor',
                value: '#1E1E1E',
                rawValue: '#1E1E1E',
            }),
            'hashed',
        );
        const b = buildClassName(
            t({
                property: 'backgroundColor',
                value: '#0f0f0f',
                rawValue: '#0f0f0f',
            }),
            'hashed',
        );
        expect(a).not.toBe(b);
    });

    it('separates djb2-natural hex collisions (#2B2B2B vs #1c1c1c)', () => {
        const a = buildClassName(
            t({
                property: 'color',
                value: '#2B2B2B',
                rawValue: '#2B2B2B',
            }),
            'hashed',
        );
        const b = buildClassName(
            t({
                property: 'color',
                value: '#1c1c1c',
                rawValue: '#1c1c1c',
            }),
            'hashed',
        );
        expect(a).not.toBe(b);
    });
});

describe('generateArbitraryValueSelector', () => {
    it('deterministic', () => {
        expect(generateArbitraryValueSelector('foo')).toBe(generateArbitraryValueSelector('foo'));
    });
    it('base62 output only', () => {
        expect(generateArbitraryValueSelector('padding|base')).toMatch(/^[0-9a-zA-Z_]+$/);
    });
    it('atStart=true escapes leading digit', () => {
        for (let i = 0; i < 200; i++) {
            const s = `input-${i}`;
            const bare = generateArbitraryValueSelector(s);
            if (/^[0-9]/.test(bare)) {
                expect(generateArbitraryValueSelector(s, true)).toMatch(/^_/);
                return;
            }
        }
    });
});
