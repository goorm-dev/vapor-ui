import { describe, expect, it } from 'vitest';

import { buildBlockClassName, generateArbitraryValueSelector } from './class-name';

const block = (overrides: Partial<Parameters<typeof buildBlockClassName>[0]> = {}) =>
    buildBlockClassName({
        scope: 'src/button.tsx',
        signature: 'base|padding:var(--vapor-size-space-400)',
        mode: 'hashed',
        ...overrides,
    });

describe('buildBlockClassName — hashed (prod)', () => {
    it('shape: v + base62', () => {
        expect(block()).toMatch(/^v[0-9a-zA-Z]+$/);
    });

    it('same scope + signature → same class', () => {
        expect(block()).toBe(block());
    });

    it('different scope → different class (same declarations in another file)', () => {
        expect(block({ scope: 'src/card.tsx' })).not.toBe(block());
    });

    it('different signature → different class', () => {
        expect(block({ signature: 'base|padding:var(--vapor-size-space-200)' })).not.toBe(block());
    });

    it('declaration order is part of identity', () => {
        const a = block({ signature: 'base|color:red;base|padding:0' });
        const b = block({ signature: 'base|padding:0;base|color:red' });
        expect(a).not.toBe(b);
    });

    // Regression: djb2 가 hex 값끼리 자연 충돌하던 쌍을 murmur2 는 분리한다.
    it('separates djb2-natural hex collisions (#1E1E1E vs #0f0f0f)', () => {
        const a = block({ signature: 'base|background-color:#1E1E1E' });
        const b = block({ signature: 'base|background-color:#0f0f0f' });
        expect(a).not.toBe(b);
    });

    it('ignores debugId', () => {
        expect(block({ debugId: 'Header' })).toBe(block());
    });
});

describe('buildBlockClassName — readable (dev)', () => {
    it('shape: <debugId>_<hash>', () => {
        expect(block({ mode: 'readable', debugId: 'Header' })).toMatch(/^Header_[0-9a-zA-Z]+$/);
    });

    it('falls back to `css` without debugId', () => {
        expect(block({ mode: 'readable' })).toMatch(/^css_[0-9a-zA-Z]+$/);
    });

    it('sanitizes debugId into a valid class ident', () => {
        expect(block({ mode: 'readable', debugId: '1 my.name' })).toMatch(
            /^_1_my_name_[0-9a-zA-Z]+$/,
        );
    });

    it('readable and hashed share the hash', () => {
        const dev = block({ mode: 'readable', debugId: 'Header' });
        const prod = block();
        expect(dev.slice(dev.lastIndexOf('_') + 1)).toBe(prod.slice(1));
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
