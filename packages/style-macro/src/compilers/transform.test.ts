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

    it('preserves `use client` directive when auto-injecting runtime import', () => {
        const source = [
            `'use client';`,
            ``,
            `import { useState } from 'react';`,
            `import { css } from '@vapor-ui/style-macro';`,
            ``,
            `function Comp({ color }) {`,
            `  const [, setX] = useState(0);`,
            `  return <div className={css({ color })} />;`,
            `}`,
        ].join('\n');
        const out = transform({ source, filename: '/UC.tsx' });
        expect(out.errors).toEqual([]);
        // directive 가 반드시 첫 statement 로 유지되어야 함 (Next SWC 요구).
        expect(out.code.startsWith(`'use client';`)).toBe(true);
        // runtime import 가 directive 뒤에 삽입됐는지 확인.
        const firstLines = out.code.split('\n').slice(0, 4).join('\n');
        expect(firstLines).toContain('_resolveToken');
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

describe('transform — ternary (entry-level)', () => {
    it('rewrites single ternary on non-shorthand property', () => {
        const source = src(`const cls = css({ color: cond ? '$fg-primary' : '$fg-secondary' });`);
        const out = transform({ source, filename: '/T1.tsx' });
        expect(out.errors).toEqual([]);
        // 삼항 식이 생성 코드 안에 유지.
        expect(out.code).toMatch(/cond\s*\?/);
        // conseq / alt 양쪽 class 가 CSS 에 모두 emit.
        expect(out.css).toContain('--vapor-color-foreground-primary');
        expect(out.css).toContain('--vapor-color-foreground-secondary');
    });

    it('(#2) handles ternary on shorthand property (padding)', () => {
        // padding → padding-top/right/bottom/left 4개로 확장. 분기당 4개 rule.
        const source = src(`const cls = css({ padding: compact ? '$space-100' : '$space-400' });`);
        const out = transform({ source, filename: '/T2.tsx' });
        expect(out.errors).toEqual([]);
        // 삼항식 유지되어야 함 — 양 분기 join 으로 떨어지면 버그.
        expect(out.code).toMatch(/compact\s*\?/);
        // 삼항식 branch 안에 공백으로 join 된 4개 class 가 있어야 함.
        const ternMatch = out.code.match(/compact\s*\?\s*'([^']+)'\s*:\s*'([^']+)'/);
        expect(ternMatch).not.toBeNull();
        expect(ternMatch![1].split(' ').length).toBe(4);
        expect(ternMatch![2].split(' ').length).toBe(4);
    });

    it('(#3) handles dynamic value + ternary in same call', () => {
        const source = [
            `import { css } from '@vapor-ui/style-macro';`,
            `function C({ color, active }) {`,
            `  return <div className={css({`,
            `    color,`,
            `    backgroundColor: active ? '$bg-primary' : '$bg-secondary',`,
            `  })} />;`,
            `}`,
        ].join('\n');
        const out = transform({ source, filename: '/T3.tsx' });
        expect(out.errors).toEqual([]);
        // dynamic 처리 통과: _resolveToken + style attr.
        expect(out.code).toContain('_resolveToken');
        // 삼항식 유지되어야 함 — dynamic path 때문에 skip 되면 버그.
        expect(out.code).toMatch(/active\s*\?/);
    });

    it('(#4) handles multiple entry-level ternaries', () => {
        const source = src(
            `const cls = css({` +
                `color: a ? '$fg-primary' : '$fg-secondary',` +
                `backgroundColor: b ? '$bg-primary' : '$bg-secondary'` +
                `});`,
        );
        const out = transform({ source, filename: '/T4.tsx' });
        expect(out.errors).toEqual([]);
        // 두 삼항 모두 유지.
        const aCount = (out.code.match(/\ba\s*\?/g) || []).length;
        const bCount = (out.code.match(/\bb\s*\?/g) || []).length;
        expect(aCount).toBe(1);
        expect(bCount).toBe(1);
    });

    it('mixes static props with ternary', () => {
        const source = src(
            `const cls = css({ display: 'flex', color: cond ? '$fg-primary' : '$fg-secondary' });`,
        );
        const out = transform({ source, filename: '/T5.tsx' });
        expect(out.errors).toEqual([]);
        // 삼항 식 유지 + static class (display) 는 rest 에 join.
        expect(out.code).toMatch(/cond\s*\?/);
        // 전체 replacement 안에 ' + ' 공백 결합 흔적.
        expect(out.code).toMatch(/\+\s*' '\s*\+/);
    });
});
