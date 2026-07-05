import { describe, expect, it } from 'vitest';

import { buildClassName } from './class-name';
import type { Tuple } from './types';

const t = (overrides: Partial<Tuple>): Tuple => ({
    property: 'padding',
    propertyShort: 'p',
    valueShort: '400',
    cssValue: 'var(--vapor-size-space-400)',
    condition: { kind: 'default' },
    ...overrides,
});

describe('buildClassName', () => {
    it('default: _<short>-<value>', () => {
        expect(buildClassName(t({}))).toBe('_p-400');
    });
    it('default: bg primary', () => {
        expect(
            buildClassName(
                t({ property: 'backgroundColor', propertyShort: 'bg', valueShort: 'primary' }),
            ),
        ).toBe('_bg-primary');
    });
    it('named BP: _sm-<short>-<value>', () => {
        expect(
            buildClassName(t({ valueShort: '100', condition: { kind: 'named-bp', name: 'sm' } })),
        ).toBe('_sm-p-100');
    });
    it('pseudo: strip leading underscore', () => {
        expect(
            buildClassName(
                t({
                    property: 'backgroundColor',
                    propertyShort: 'bg',
                    valueShort: 'primary-hover',
                    condition: { kind: 'pseudo', name: '_hover' },
                }),
            ),
        ).toBe('_hover-bg-primary-hover');
    });
    it('raw media: _mq<hash6>-<short>-<value>', () => {
        const cls = buildClassName(
            t({
                valueShort: '400',
                condition: { kind: 'raw-media', query: '(min-width: 2560px)', hash: 'abcdef12' },
            }),
        );
        expect(cls).toBe('_mqabcdef-p-400');
    });
});

describe('buildClassName (hashed)', () => {
    it('produces _<8-char base36 slug>', () => {
        const cls = buildClassName(t({}), 'hashed');
        expect(cls).toMatch(/^_[0-9a-z]{8}$/);
    });
    it('stable: same tuple → same class', () => {
        const a = buildClassName(t({}), 'hashed');
        const b = buildClassName(t({}), 'hashed');
        expect(a).toBe(b);
    });
    it('distinct condition → distinct class', () => {
        const def = buildClassName(t({}), 'hashed');
        const sm = buildClassName(t({ condition: { kind: 'named-bp', name: 'sm' } }), 'hashed');
        const hover = buildClassName(
            t({ condition: { kind: 'pseudo', name: '_hover' } }),
            'hashed',
        );
        expect(new Set([def, sm, hover]).size).toBe(3);
    });
    it('distinct cssValue → distinct class', () => {
        const a = buildClassName(t({ cssValue: 'var(--a)' }), 'hashed');
        const b = buildClassName(t({ cssValue: 'var(--b)' }), 'hashed');
        expect(a).not.toBe(b);
    });
    it('distinct property → distinct class', () => {
        const a = buildClassName(t({ property: 'padding' }), 'hashed');
        const b = buildClassName(t({ property: 'margin' }), 'hashed');
        expect(a).not.toBe(b);
    });
});
