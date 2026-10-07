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
    it('shape: _<propHash><valueHash> (base62)', () => {
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
