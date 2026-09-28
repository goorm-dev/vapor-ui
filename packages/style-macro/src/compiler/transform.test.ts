import { describe, expect, it } from 'vitest';

import { transform } from './transform';

const src = (body: string) =>
    [`import { css } from '@vapor-ui/style-macro';`, body].join('\n');

describe('transform — static syntax', () => {
    it('rewrites css({ prop: literal }) to string literal', () => {
        const out = transform({
            source: src(`const cls = css({ padding: '$space-400' });`),
            filename: '/A.tsx',
        });
        expect(out.errors).toEqual([]);
        expect(out.css).toContain('padding-top');
        expect(out.code).toMatch(/const cls = '[^']+';/);
    });

    it('supports nested :hover selector', () => {
        const out = transform({
            source: src(
                `const cls = css({ color: '$fg-primary', ':hover': { color: '$fg-secondary' } });`,
            ),
            filename: '/B.tsx',
        });
        expect(out.errors).toEqual([]);
        expect(out.css).toMatch(/:hover/);
    });

    it('supports @media nesting', () => {
        const out = transform({
            source: src(
                `const cls = css({ padding: '$space-400', '@media (min-width: 768px)': { padding: '$space-800' } });`,
            ),
            filename: '/C.tsx',
        });
        expect(out.errors).toEqual([]);
        expect(out.css).toMatch(/@media \(min-width: 768px\)/);
    });

    it('supports pseudo-element ::before', () => {
        const out = transform({
            source: src(
                `const cls = css({ '::before': { content: '""', display: 'block' } });`,
            ),
            filename: '/D.tsx',
        });
        expect(out.errors).toEqual([]);
        expect(out.css).toMatch(/::before/);
    });

    it('supports attribute selector', () => {
        const out = transform({
            source: src(
                `const cls = css({ '[data-active="true"]': { color: '$fg-primary' } });`,
            ),
            filename: '/E.tsx',
        });
        expect(out.errors).toEqual([]);
        expect(out.css).toContain('[data-active="true"]');
    });

    it('supports self-ref &.class selector', () => {
        const out = transform({
            source: src(
                `const cls = css({ '&.selected': { fontWeight: 700 } });`,
            ),
            filename: '/F.tsx',
        });
        expect(out.errors).toEqual([]);
        expect(out.css).toMatch(/\.[^ ]+\.selected/);
    });

    it('reports unknown token', () => {
        const out = transform({
            source: src(`const cls = css({ padding: '$doesNotExist' });`),
            filename: '/G.tsx',
        });
        expect(out.errors.length).toBeGreaterThan(0);
        expect(out.errors[0].code).toBe('unknown-token');
    });

    it('rejects bare selector (must start with :, ::, @, [, &)', () => {
        const out = transform({
            source: src(`const cls = css({ 'div span': { color: 'red' } });`),
            filename: '/H.tsx',
        });
        expect(out.errors.length).toBeGreaterThan(0);
        expect(out.errors[0].code).toBe('invalid-selector');
    });
});

describe('transform — dynamic slots', () => {
    it('emits a var(--slot-…) placeholder for a non-literal value', () => {
        const source = [
            `import { css } from '@vapor-ui/style-macro';`,
            `function Comp({ color }) {`,
            `  return <div className={css({ color })} />;`,
            `}`,
        ].join('\n');
        const out = transform({ source, filename: '/I.tsx' });
        expect(out.errors).toEqual([]);
        expect(out.css).toMatch(/color:\s*var\(--/);
    });

    it('injects `style={{ …slot: _resolveToken(prop, expr) }}` on the JSX element', () => {
        const source = [
            `import { css } from '@vapor-ui/style-macro';`,
            `function Comp({ color }) {`,
            `  return <div className={css({ color })} />;`,
            `}`,
        ].join('\n');
        const out = transform({ source, filename: '/J.tsx' });
        expect(out.errors).toEqual([]);
        expect(out.code).toContain('style={');
        expect(out.code).toContain('_resolveToken(');
    });

    it('auto-imports _resolveToken from @vapor-ui/style-macro', () => {
        const source = [
            `import { css } from '@vapor-ui/style-macro';`,
            `function Comp({ color }) {`,
            `  return <div className={css({ color })} />;`,
            `}`,
        ].join('\n');
        const out = transform({ source, filename: '/K.tsx' });
        expect(out.errors).toEqual([]);
        expect(out.code).toContain('_resolveToken');
        // 기존 css import 라인에 specifier 추가.
        expect(out.code).toMatch(/import\s*\{[^}]*_resolveToken[^}]*\}\s*from\s*'@vapor-ui\/style-macro'/);
    });

    it('wraps existing style prop with _mergeStyle', () => {
        const source = [
            `import { css } from '@vapor-ui/style-macro';`,
            `function Comp({ color, myStyle }) {`,
            `  return <div style={myStyle} className={css({ color })} />;`,
            `}`,
        ].join('\n');
        const out = transform({ source, filename: '/L.tsx' });
        expect(out.errors).toEqual([]);
        expect(out.code).toContain('_mergeStyle(');
    });
});

describe('transform — provider detection', () => {
    it('sets hasProviderImport when ThemeProvider is imported from @vapor-ui/core', () => {
        const source = [
            `import { ThemeProvider } from '@vapor-ui/core';`,
            `import { css } from '@vapor-ui/style-macro';`,
            `const cls = css({ padding: '$space-100' });`,
        ].join('\n');
        const out = transform({ source, filename: '/M.tsx' });
        expect(out.hasProviderImport).toBe(true);
    });

    it('does not set hasProviderImport when only css() is used', () => {
        const source = src(`const cls = css({ padding: '$space-100' });`);
        const out = transform({ source, filename: '/N.tsx' });
        expect(out.hasProviderImport).toBe(false);
    });
});
