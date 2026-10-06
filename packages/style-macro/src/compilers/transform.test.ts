import { describe, expect, it } from 'vitest';

import { transform } from './transform';

const src = (body: string) => [`import { css } from '@vapor-ui/style-macro';`, body].join('\n');

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
            source: src(`const cls = css({ '::before': { content: '""', display: 'block' } });`),
            filename: '/D.tsx',
        });
        expect(out.errors).toEqual([]);
        expect(out.css).toMatch(/::before/);
    });

    it('supports attribute selector', () => {
        const out = transform({
            source: src(`const cls = css({ '[data-active="true"]': { color: '$fg-primary' } });`),
            filename: '/E.tsx',
        });
        expect(out.errors).toEqual([]);
        expect(out.css).toContain('[data-active="true"]');
    });

    it('supports self-ref &.class selector', () => {
        const out = transform({
            source: src(`const cls = css({ '&.selected': { fontWeight: 700 } });`),
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

    it('auto-imports _resolveToken from the dedicated runtime subpath', () => {
        const source = [
            `import { css } from '@vapor-ui/style-macro';`,
            `function Comp({ color }) {`,
            `  return <div className={css({ color })} />;`,
            `}`,
        ].join('\n');
        const out = transform({ source, filename: '/K.tsx' });
        expect(out.errors).toEqual([]);
        expect(out.code).toContain('_resolveToken');
        // 소비자 코드에 subpath import 라인 추가 (bundler-neutral).
        expect(out.code).toMatch(
            /import\s*\{\s*_resolveToken\s*\}\s*from\s*'@vapor-ui\/style-macro\/__runtime__'/,
        );
        // 사용자의 `css` import 는 보존되고 helper specifier 가 섞여 들어가지 않음.
        expect(out.code).toMatch(/import\s*\{\s*css\s*\}\s*from\s*'@vapor-ui\/style-macro'/);
    });

    it('merges an existing style prop by spreading', () => {
        const source = [
            `import { css } from '@vapor-ui/style-macro';`,
            `function Comp({ color, myStyle }) {`,
            `  return <div style={myStyle} className={css({ color })} />;`,
            `}`,
        ].join('\n');
        const out = transform({ source, filename: '/L.tsx' });
        expect(out.errors).toEqual([]);
        // 원본 식(`myStyle`) 과 slot object 를 spread 로 결합.
        expect(out.code).toMatch(/\{\s*\.\.\.\(myStyle\)\s*,\s*\.\.\.\{/);
        // helper import 는 `_resolveToken` 만 — `_mergeStyle` 은 inline spread 로 처리.
        expect(out.code).not.toContain('_mergeStyle');
    });
});
