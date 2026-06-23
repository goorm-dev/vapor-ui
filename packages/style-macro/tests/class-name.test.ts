import { describe, expect, it } from 'vitest';

import { buildClassName } from '../src/class-name';
import type { Tuple } from '../src/types';

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
