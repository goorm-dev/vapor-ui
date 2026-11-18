import { parseSync } from 'oxc-parser';
import { describe, expect, it } from 'vitest';

import { transform } from './transform';

const src = (body: string) => [`import { css } from '@vapor-ui/style-macro';`, body].join('\n');

describe('transform — static syntax', () => {
    it('rewrites css({ prop: literal }) to a class-list string literal', () => {
        const out = transform({
            source: src(`const cls = css({ padding: '$space-400' });`),
            filename: '/A.tsx',
        });
        expect(out.errors).toEqual([]);
        expect(out.css).toContain('padding-top');
        // 단일 object 호출 → class 1개 string literal. 런타임 import 없음.
        expect(out.code).toMatch(/const cls = 'cls_[A-Za-z0-9]+';/);
        expect(out.code).not.toContain('__runtime__');
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

    it('reports unknown token as build error', () => {
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

    describe('the key, not the value, decides between a declaration and a nested rule', () => {
        const run = (body: string) => transform({ source: src(body), filename: '/K.tsx' });

        it.each([
            [`export const f = (h) => css({ ':hover': h });`, 'h }'],
            [`export const f = () => css({ '@media (min-width: 1px)': 'red' });`, `'red'`],
            [`export const f = (c) => css({ '&.on': c ? 'a' : 'b' });`, 'c ?'],
        ])('rejects a nested-rule key whose value is not an object: %s', (body, at) => {
            const out = run(body);
            expect(out.errors.map((e) => e.code)).toEqual(['invalid-input-shape']);
            expect(out.errors[0]!.loc.column).toBe(src(body).split('\n')[1]!.indexOf(at));
            expect(out.css ?? '').not.toContain(':hover:');
        });

        it('treats null / undefined under a nested-rule key as no rule', () => {
            const out = run(
                `export const a = css({ color: 'red', ':hover': undefined, '&.x': null });`,
            );
            expect(out.errors).toEqual([]);
            expect(out.css).not.toContain(':hover');
        });

        it('still rejects an object under a property key', () => {
            const out = run(`export const a = css({ color: { x: 1 } });`);
            expect(out.errors.map((e) => e.code)).toEqual(['invalid-selector']);
        });
    });

    it('rejects a bare branch inside a comma list instead of leaking it', () => {
        const out = transform({
            source: src(`const cls = css({ ':hover, div': { color: 'red' } });`),
            filename: '/H.tsx',
        });
        expect(out.errors.map((e) => e.code)).toEqual(['invalid-selector']);
    });

    describe('nested selectors resolve per level', () => {
        const cssOf = (style: string) => {
            const out = transform({ source: src(`const c = css(${style});`), filename: '/N.tsx' });
            expect(out.errors).toEqual([]);
            return out.css!.replace(/\.c_[A-Za-z0-9]+/g, '.c');
        };

        it('distributes a comma parent over a nested `&`', () => {
            expect(
                cssOf(`{ '&[data-a], &[data-b]': { '&[data-c]': { color: 'red' } } }`),
            ).toContain('.c[data-a][data-c], .c[data-b][data-c] {');
        });

        it('places `&` under a pseudo parent at the parent selector', () => {
            expect(cssOf(`{ ':focus': { '&:hover': { color: 'red' } } }`)).toContain(
                '.c:focus:hover {',
            );
        });

        it('hoists an at-rule nested under a pseudo inside an at-rule', () => {
            const css = cssOf(
                `{ '@media (min-width: 1px)': { ':hover': { '@supports (display: grid)': { color: 'red' } } } }`,
            );
            expect(css).toMatch(
                /@media \(min-width: 1px\) \{\s*@supports \(display: grid\) \{\s*\.c:hover \{ color: red; \}/,
            );
        });
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

    describe('directive prologue', () => {
        // 출력을 다시 파싱해 prologue 가 그대로 첫 statement 들인지 본다 (Next SWC 와 같은 판정).
        const prologue = (code: string) => {
            const { body } = parseSync('/D.tsx', code, {
                sourceType: 'module',
                lang: 'tsx',
            }).program;
            const out: string[] = [];
            for (const s of body) {
                if (!('directive' in s) || typeof s.directive !== 'string') break;
                out.push(s.directive);
            }
            return out;
        };
        const dynamicBody = `export const C = ({ c }) => <div className={css({ color: c })} />;`;

        it.each([
            [
                'same-line comment',
                `'use client'; // c\nimport { css } from '@vapor-ui/style-macro';`,
            ],
            ['same-line import', `'use client'; import { css } from '@vapor-ui/style-macro';`],
            ['no semicolon', `'use client'\nimport { css } from '@vapor-ui/style-macro';`],
            [
                'leading comments',
                `/** doc */\n// x\n'use client';\nimport { css } from '@vapor-ui/style-macro';`,
            ],
            [
                'multiple directives',
                `'use strict'; "use client";\nimport { css } from '@vapor-ui/style-macro';`,
            ],
            ['CRLF', `'use client';\r\nimport { css } from '@vapor-ui/style-macro';`],
        ])('keeps the prologue first with a runtime import: %s', (_, head) => {
            const source = `${head}\n${dynamicBody}`;
            const out = transform({ source, filename: '/D.tsx' });
            expect(out.errors).toEqual([]);
            expect(out.code).toContain('__runtime__');
            expect(prologue(out.code)).toEqual(prologue(source));
        });

        it('keeps the prologue first with a CSS import and no other import', () => {
            // css 가 import 로 오지 않으면 매크로가 적용되지 않으므로, 소스 import 를 뒤에 둔다.
            const source = `'use client'; // c\nimport { css } from '@vapor-ui/style-macro';\nexport const a = css({ color: 'red' });`;
            const out = transform({ source, filename: '/D.tsx', cssImport: './D.tsx.vapor.css' });
            expect(prologue(out.code)).toEqual(['use client']);
        });

        it('does not treat a parenthesized string as a directive', () => {
            const source = `('use client');\nimport { css } from '@vapor-ui/style-macro';\n${dynamicBody}`;
            const out = transform({ source, filename: '/D.tsx' });
            expect(out.code.startsWith('import {')).toBe(true);
        });
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
        // `_resolveToken` 뒤에 사용 axis 식별자가 함께 묶여 들어올 수 있음.
        expect(out.code).toMatch(
            /import\s*\{[^}]*\b_resolveToken\b[^}]*\}\s*from\s*'@vapor-ui\/style-macro\/__runtime__'/,
        );
        // 사용자의 `css` import 는 보존되고 helper specifier 가 섞여 들어가지 않음.
        expect(out.code).toMatch(/import\s*\{\s*css\s*\}\s*from\s*'@vapor-ui\/style-macro'/);
    });

    it('emits axis identifiers alongside _resolveToken from a single runtime subpath', () => {
        const source = [
            `import { css } from '@vapor-ui/style-macro';`,
            `function Comp({ c, w }) {`,
            `  return <div className={css({ color: c, width: w })} />;`,
            `}`,
        ].join('\n');
        const out = transform({ source, filename: '/N.tsx' });
        expect(out.errors).toEqual([]);
        // `_resolveToken` 과 사용된 axis 가 한 import 라인에 묶여 들어오고,
        // 사용자 스코프 충돌을 막기 위해 axis 는 `__vaporAxis_<name>` alias 로 import.
        expect(out.code).toMatch(
            /import\s*\{[^}]*\b_resolveToken\b[^}]*\bcolor\s+as\s+__vaporAxis_color\b[^}]*\bdimension\s+as\s+__vaporAxis_dimension\b[^}]*\}\s*from\s*'@vapor-ui\/style-macro\/__runtime__'/,
        );
        // `_resolveToken` 의 첫 인자는 axis alias 식별자(문자열·bare axis 이름 모두 아님).
        expect(out.code).toMatch(/_resolveToken\(\s*__vaporAxis_color\s*,/);
        expect(out.code).toMatch(/_resolveToken\(\s*__vaporAxis_dimension\s*,/);
        expect(out.code).not.toMatch(/_resolveToken\(\s*color\s*,/);
        // 과거 property-string 형태는 더 이상 emit 되지 않음.
        expect(out.code).not.toMatch(/_resolveToken\(\s*['"]color['"]/);
    });

    it('aliases axis imports so user bindings named `color` or `space` do not collide', () => {
        const source = [
            `import { css } from '@vapor-ui/style-macro';`,
            // 사용자가 로컬 `color` 변수를 쓰는 흔한 패턴.
            `function Comp({ color }) {`,
            `  return <div className={css({ color })} />;`,
            `}`,
        ].join('\n');
        const out = transform({ source, filename: '/collide.tsx' });
        expect(out.errors).toEqual([]);
        // 생성 코드에서 `_resolveToken` 첫 인자는 사용자 지역변수가 아닌 alias.
        expect(out.code).toMatch(/_resolveToken\(\s*__vaporAxis_color\s*,/);
        // bare `color` 로 import 되지 않음.
        expect(out.code).not.toMatch(
            /import\s*\{[^}]*\bcolor\s*\}\s*from\s*'@vapor-ui\/style-macro\/__runtime__'/,
        );
    });

    it('keeps dynamic shorthand as the original property (no longhand expansion)', () => {
        // 동적 `padding: w` 는 longhand 로 쪼개지 않는다. 런타임 값이 `'8px 16px'`
        // 처럼 다중 값이면 각 longhand 가 전체 값을 받아 CSS 파싱이 실패한다.
        const source = [
            `import { css } from '@vapor-ui/style-macro';`,
            `function Comp({ p }) {`,
            `  return <div className={css({ padding: p })} />;`,
            `}`,
        ].join('\n');
        const out = transform({ source, filename: '/dyn.tsx' });
        expect(out.errors).toEqual([]);
        // longhand 선언 없음.
        expect(out.css ?? '').not.toMatch(/padding-top/);
        expect(out.css ?? '').not.toMatch(/padding-right/);
        // 원 shorthand 로 slot 참조.
        expect(out.css ?? '').toMatch(/padding:\s*var\(--vapor-_[^)]+\)/);
    });

    it('uses `_ix` (not `_resolveToken`) for properties without a token axis', () => {
        const source = [
            `import { css } from '@vapor-ui/style-macro';`,
            `function Comp({ x }) {`,
            `  return <div className={css({ 'grid-template-rows': x })} />;`,
            `}`,
        ].join('\n');
        const out = transform({ source, filename: '/O.tsx' });
        expect(out.errors).toEqual([]);
        // axis 없는 slot 은 숫자-unit 전용 _ix 로 직행 — token lookup 코드가
        // bundle 에 포함되지 않는다.
        expect(out.code).toMatch(/_ix\(\s*x\s*,\s*'px'\s*\)/);
        // _resolveToken 참조도, axis alias 도 없어야 함.
        expect(out.code).not.toContain('_resolveToken');
        expect(out.code).not.toContain('__vaporAxis_');
        // runtime import 는 _ix 포함.
        expect(out.code).toMatch(
            /import\s*\{[^}]*\b_ix\b[^}]*\}\s*from\s*'@vapor-ui\/style-macro\/__runtime__'/,
        );
    });

    it('wraps slot values with `?? var(..., )` sentinel for undefined safety', () => {
        const source = [
            `import { css } from '@vapor-ui/style-macro';`,
            `function Comp({ color }) {`,
            `  return <div className={css({ color })} />;`,
            `}`,
        ].join('\n');
        const out = transform({ source, filename: '/sentinel.tsx' });
        expect(out.errors).toEqual([]);
        // undefined 를 넘겨도 slot 변수가 self-reference fallback 으로 유지되어
        // 부모 상속 체인이 끊기지 않도록 모든 slot emit 에 sentinel 을 붙인다.
        expect(out.code).toMatch(/\?\?\s*'var\(--[^)]+,\s*\)'/);
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
        // slot 을 먼저, 사용자 `style` 을 뒤로 — 사용자 값이 slot 기본값을 이긴다 (리뷰 #6b).
        // 함수형 style(stateful callback)도 처리하도록 `_mergeStyle` 을 거친다.
        expect(out.code).toMatch(/style=\{_mergeStyle\(\{[^}]*--vapor[^}]*\}, \(myStyle\)\)\}/);
    });
});

describe('transform — ternary (entry-level)', () => {
    const classOf = (code: string) => /const cls = (.+);/.exec(code)![1];

    it('emits one merged block per branch and picks it with the original test', () => {
        const source = src(`const cls = css({ color: cond ? '$fg-primary' : '$fg-secondary' });`);
        const out = transform({ source, filename: '/T1.tsx' });
        expect(out.errors).toEqual([]);
        expect(classOf(out.code)).toMatch(/^\(cond \? 'cls_\w+' : 'cls_\w+'\)$/);
        expect(out.css).toContain('--vapor-color-foreground-primary');
        expect(out.css).toContain('--vapor-color-foreground-secondary');
    });

    it('(#2) ternary on shorthand expands longhands inside each branch block', () => {
        const source = src(`const cls = css({ padding: compact ? '$space-100' : '$space-400' });`);
        const out = transform({ source, filename: '/T2.tsx' });
        expect(out.errors).toEqual([]);
        expect((out.code.match(/compact\s*\?/g) ?? []).length).toBe(1);
        expect(out.code).not.toContain('_cx');
        for (const p of ['padding-top', 'padding-right', 'padding-bottom', 'padding-left']) {
            expect(out.css).toContain(p);
        }
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
        expect(out.code).toContain('_resolveToken');
        expect(out.code).toMatch(/active\s*\?/);
        // 두 분기 블록 모두 dynamic slot 선언을 가진다.
        expect((out.css!.match(/color: var\(--vapor-_/g) ?? []).length).toBe(2);
    });

    it('(#4) multiple ternaries → nested selection over every combination', () => {
        const source = src(
            `const cls = css({` +
                `color: a ? '$fg-primary' : '$fg-secondary',` +
                `backgroundColor: b ? '$bg-primary' : '$bg-secondary'` +
                `});`,
        );
        const out = transform({ source, filename: '/T4.tsx' });
        expect(out.errors).toEqual([]);
        expect((out.code.match(/\ba\s*\?/g) || []).length).toBe(1);
        expect((out.code.match(/\bb\s*\?/g) || []).length).toBe(2);
        expect((out.css!.match(/^\s*\.cls_\w+ \{/gm) ?? []).length).toBe(4);
    });

    it('each branch block also carries the static declarations', () => {
        const source = src(
            `const cls = css({ display: 'flex', color: cond ? '$fg-primary' : '$fg-secondary' });`,
        );
        const out = transform({ source, filename: '/T5.tsx' });
        expect(out.errors).toEqual([]);
        const blocks = out.css!.match(/\.cls_\w+ \{[^}]*\}/g)!;
        expect(blocks).toHaveLength(2);
        for (const b of blocks) expect(b).toContain('display: flex;');
    });

    it('ternary branch overrides an earlier declaration and loses to a later one', () => {
        const out = transform({
            source: src(
                `const cls = css({ color: on ? 'blue' : 'green', paddingTop: 0 }, { color: 'black' });`,
            ),
            filename: '/T6.tsx',
        });
        expect(out.errors).toEqual([]);
        // 뒤 인자의 color 가 두 분기를 모두 이겨 분기가 사라진다.
        expect(classOf(out.code)).toMatch(/^'cls_\w+'$/);
        expect(out.css).toContain('color: black;');
        expect(out.css).not.toContain('color: blue');
    });
});

describe('transform — token resolve (build error)', () => {
    // 성공한 fragment 는 치환, 실패 fragment 는 build error 로 ctx.errors push.

    it('resolves standalone `$token` on axis-매치 property', () => {
        const source = src(`const cls = css({ color: '$fg-primary' });`);
        const out = transform({ source, filename: '/EM1.tsx' });
        expect(out.errors).toEqual([]);
        expect(out.css).toContain('var(--vapor-color-foreground-primary)');
    });

    it('resolves multiple embedded tokens on axis-매치 property (padding)', () => {
        const source = src(`const cls = css({ padding: '$space-100 $space-200' });`);
        const out = transform({ source, filename: '/EM2.tsx' });
        expect(out.errors).toEqual([]);
        expect(out.css).toContain('var(--vapor-size-space-100)');
        expect(out.css).toContain('var(--vapor-size-space-200)');
    });

    it('passes raw non-token value through', () => {
        const source = src(`const cls = css({ border: '1px solid black' });`);
        const out = transform({ source, filename: '/EM3.tsx' });
        expect(out.errors).toEqual([]);
    });

    it('errors on shorthand property with embedded token (border)', () => {
        const source = src(`const cls = css({ border: '1px solid $basic-black' });`);
        const out = transform({ source, filename: '/EM4.tsx' });
        expect(out.errors.length).toBeGreaterThan(0);
        expect(out.errors[0].code).toBe('unknown-property');
    });

    it('errors on standalone token on shorthand (background)', () => {
        const source = src(`const cls = css({ background: '$bg-primary' });`);
        const out = transform({ source, filename: '/EM5.tsx' });
        expect(out.errors.length).toBeGreaterThan(0);
        expect(out.errors[0].code).toBe('unknown-property');
    });

    it('errors on unknown token', () => {
        // token name 은 알파벳 시작 (`$5` 같은 숫자-only 는 token 이 아니라
        // 사용자 문자열 — 리뷰 #8 참조). 유효 패턴이지만 tokens 테이블에
        // 없는 이름을 써야 unknown-token 이 뜬다.
        const source = src(`const cls = css({ padding: '$space-nope' });`);
        const out = transform({ source, filename: '/EM6.tsx' });
        expect(out.errors.length).toBeGreaterThan(0);
        expect(out.errors[0].code).toBe('unknown-token');
    });

    it('errors on scope-mismatch token', () => {
        const source = src(`const cls = css({ color: '$bg-primary' });`);
        const out = transform({ source, filename: '/EM7.tsx' });
        expect(out.errors.length).toBeGreaterThan(0);
        expect(out.errors[0].code).toBe('scope-mismatch');
    });

    describe('a token is a whole value component outside CSS strings and url()', () => {
        const run = (decl: string) =>
            transform({ source: src(`const cls = css({ ${decl} });`), filename: '/TK.tsx' });

        it.each([
            [`content: '"Price $USD"'`, 'content: "Price $USD"'],
            [`content: "'$a $b'"`, `content: '$a $b'`],
            [`backgroundImage: 'url(/img/$logo.png)'`, 'background-image: url(/img/$logo.png)'],
            [`backgroundImage: 'url("/img/$logo.png")'`, 'background-image: url("/img/$logo.png")'],
            [`content: '"a\\\\"$b"'`, 'content: "a\\"$b"'],
        ])('leaves `$` inside a string or url() alone: %s', (decl, expected) => {
            const out = run(decl);
            expect(out.errors).toEqual([]);
            expect(out.css).toContain(expected);
        });

        it.each([
            [
                `paddingTop: 'calc($space-100 * 2)'`,
                'padding-top: calc(var(--vapor-size-space-100) * 2)',
            ],
            [`margin: '0 $space-100'`, 'var(--vapor-size-space-100)'],
        ])('resolves a token at a component boundary: %s', (decl, expected) => {
            const out = run(decl);
            expect(out.errors).toEqual([]);
            expect(out.css).toContain(expected);
        });

        it.each([
            [`'--currency': '$'`, '--currency: $;'],
            [`'--p': '$5'`, '--p: $5;'],
            [`content: '"$"'`, 'content: "$";'],
        ])('keeps a `$` that is not a token: %s', (decl, expected) => {
            const out = run(decl);
            expect(out.errors).toEqual([]);
            expect(out.css).toContain(expected);
        });

        it.each([
            `marginTop: '-$space-100'`,
            `paddingTop: 'x$space-100'`,
            `paddingTop: '$space-100%'`,
        ])('rejects a token glued to other text: %s', (decl) => {
            const out = run(decl);
            expect(out.errors.map((e) => e.code)).toEqual(['invalid-input-shape']);
        });

        it('reports token errors on one line that names the token', () => {
            const out = run(`border: '1px solid $basic-black'`);
            expect(out.errors).toHaveLength(1);
            expect(out.errors[0]!.message).not.toContain('\n');
            expect(out.errors[0]!.message).toContain('$basic-black');
            expect(out.errors[0]!.message).toContain('border');
        });
    });

    it('mixed resolved + unresolved → errors on unresolved fragment', () => {
        const source = src(`const cls = css({ padding: '$space-100 $nope-xyz' });`);
        const out = transform({ source, filename: '/EM8.tsx' });
        expect(out.errors.length).toBeGreaterThan(0);
        expect(out.errors[0].code).toBe('unknown-token');
    });
});

// PR #752 review (CHANGES_REQUESTED, 2026-11-04): 8 결함 regression snapshot.
// 수정 전엔 전부 실패 상태로 먼저 commit (TDD red).
describe('transform — PR #752 review fixtures', () => {
    it('#1 longhand overrides shorthand when declared after (padding + paddingTop)', () => {
        const source = src(`const cls = css({ padding: '$space-100', paddingTop: '$space-300' });`);
        const out = transform({ source, filename: '/R1.tsx' });
        expect(out.errors).toEqual([]);
        // emit 순서상 longhand(paddingTop)가 shorthand(padding) 뒤에 나와야 하고,
        // 같은 element에서 두 class가 함께 붙을 때 property dedupe로 last-wins.
        // 실제 테스트는 className 조합 후 cascade 모사.
        const paddingTopIdx = out.css!.lastIndexOf('padding-top:');
        const paddingAllIdx = out.css!.lastIndexOf('padding-top: var(--vapor-size-space-100)');
        // paddingTop($space-300) 이 padding($space-100) 분해보다 뒤에 와야 함.
        expect(paddingTopIdx).toBeGreaterThan(paddingAllIdx);
    });

    it('#2 max-width media queries preserve declaration order (desktop-first)', () => {
        const source = src(
            `const cls = css({` +
                `  color: '$fg-primary',` +
                `  '@media (max-width: 1024px)': { color: '$fg-secondary' },` +
                `  '@media (max-width: 768px)': { color: '$fg-hint' },` +
                `});`,
        );
        const out = transform({ source, filename: '/R2.tsx' });
        expect(out.errors).toEqual([]);
        const i1024 = out.css!.indexOf('max-width: 1024px');
        const i768 = out.css!.indexOf('max-width: 768px');
        expect(i1024).toBeGreaterThanOrEqual(0);
        expect(i768).toBeGreaterThanOrEqual(0);
        // desktop-first 선언 순서가 유지되어야 cascade 정상.
        expect(i1024).toBeLessThan(i768);
    });

    it('#3 nested @media inside pseudo emits valid CSS', () => {
        const source = src(
            `const cls = css({` +
                `  ':hover': {` +
                `    color: '$fg-primary',` +
                `    '@media (min-width: 768px)': { color: '$fg-secondary' },` +
                `    '&.active': { color: '$fg-hint' },` +
                `  },` +
                `});`,
        );
        const out = transform({ source, filename: '/R3.tsx' });
        expect(out.errors).toEqual([]);
        // 잘못된 결과: `.x:hover@media (...)` 같은 유출.
        expect(out.css).not.toMatch(/:hover@media/);
        expect(out.css).not.toMatch(/:hover&/);
        // 정상: @media 가 outer wrapping.
        expect(out.css).toMatch(/@media \(min-width: 768px\)[\s\S]*:hover/);
        // 정상: &.active 가 self-ref로 confined — class name 이 중간에 들어갈 수 있음.
        expect(out.css).toMatch(/:hover[^{]*\.active|\.active[^{]*:hover/);
    });

    it('#4 comma selector does not leak to bare pseudo', () => {
        const source = src(
            `const cls = css({ ':hover, :focus-visible': { color: '$fg-primary' } });`,
        );
        const out = transform({ source, filename: '/R4.tsx' });
        expect(out.errors).toEqual([]);
        // bare `:focus-visible` (class prefix 없음) 가 유출되면 안 됨.
        expect(out.css).not.toMatch(/,\s*:focus-visible\s*\{/);
        // 각 콤마 branch 모두 class prefix 를 가져야 함.
        const commaBlock = out.css!.match(/\.[^{,]+:hover,\s*\.[^{]+:focus-visible\s*\{/);
        expect(commaBlock).not.toBeNull();
    });

    it('#5a vendor prefix preserved (WebkitLineClamp)', () => {
        const source = src(`const cls = css({ WebkitLineClamp: 2 });`);
        const out = transform({ source, filename: '/R5a.tsx' });
        expect(out.errors).toEqual([]);
        expect(out.css).toMatch(/-webkit-line-clamp:\s*2\b/);
        // webkit-line-clamp 는 unitless.
        expect(out.css).not.toMatch(/-webkit-line-clamp:\s*2px/);
    });

    it('#5b unitless properties do not get px (aspectRatio, gridColumn, scale)', () => {
        const source = src(`const cls = css({ aspectRatio: 1, gridColumn: 2, scale: 1 });`);
        const out = transform({ source, filename: '/R5b.tsx' });
        expect(out.errors).toEqual([]);
        expect(out.css).toMatch(/aspect-ratio:\s*1\b/);
        expect(out.css).not.toMatch(/aspect-ratio:\s*1px/);
        expect(out.css).toMatch(/grid-column:\s*2\b/);
        expect(out.css).not.toMatch(/grid-column:\s*2px/);
        expect(out.css).toMatch(/\bscale:\s*1\b/);
        expect(out.css).not.toMatch(/\bscale:\s*1px/);
    });

    it('#5c dynamic numeric value gets px for unit-required properties', () => {
        const source = [
            `import { css } from '@vapor-ui/style-macro';`,
            `function Comp({ w }) {`,
            `  return <div className={css({ width: w })} />;`,
            `}`,
        ].join('\n');
        const out = transform({ source, filename: '/R5c.tsx' });
        expect(out.errors).toEqual([]);
        // runtime helper 가 숫자 100 → '100px' 로 변환해야 함. 호출 안에 property axis
        // 또는 unit 정보가 전달되어야 함.
        expect(out.code).toMatch(/_resolveToken\(\s*__vaporAxis_\w+\s*,\s*w\b/);
    });

    it('#6a multi-token value resolves each fragment (padding)', () => {
        const source = src(`const cls = css({ padding: '$space-100 $space-200' });`);
        const out = transform({ source, filename: '/R6a.tsx' });
        expect(out.errors).toEqual([]);
        expect(out.css).toContain('var(--vapor-size-space-100)');
        expect(out.css).toContain('var(--vapor-size-space-200)');
    });

    it('#6b injected style does not override existing style prop', () => {
        const source = [
            `import { css } from '@vapor-ui/style-macro';`,
            `function Comp({ color, myStyle }) {`,
            `  return <div style={myStyle} className={css({ color })} />;`,
            `}`,
        ].join('\n');
        const out = transform({ source, filename: '/R6b.tsx' });
        expect(out.errors).toEqual([]);
        // slot 변수 먼저, 사용자 style 이 뒤에 — 사용자가 이김.
        expect(out.code).toMatch(/style=\{_mergeStyle\(\{[^}]*--vapor[^}]*\}, \(myStyle\)\)\}/);
    });

    it('#6c CSS variable does not inherit to nested same-class element', () => {
        const source = [
            `import { css } from '@vapor-ui/style-macro';`,
            `function Comp({ color }) {`,
            `  return <div className={css({ color })} />;`,
            `}`,
        ].join('\n');
        const out = transform({ source, filename: '/R6c.tsx' });
        expect(out.errors).toEqual([]);
        // 상속 차단은 sentinel 이 담당: 이 class 를 가진 element 는 항상 자기 slot 을
        // inline style 로 설정하고, 값이 없으면 `var(--x,)` 자기 참조(cycle) → guaranteed-invalid.
        expect(out.code).toMatch(/'(--vapor-_\w+)': .+ \?\? 'var\(\1,\)'/);
        expect(out.css).not.toContain('@property');
    });

    it('#7 !important preserved on all expanded longhands (margin)', () => {
        const source = src(`const cls = css({ margin: '0 auto !important' });`);
        const out = transform({ source, filename: '/R7.tsx' });
        expect(out.errors).toEqual([]);
        // 각 longhand 모두 !important 와 원 값 조각 유지.
        expect(out.css).toMatch(/margin-top:\s*0\s*!important/);
        expect(out.css).toMatch(/margin-right:\s*auto\s*!important/);
        expect(out.css).toMatch(/margin-bottom:\s*0\s*!important/);
        expect(out.css).toMatch(/margin-left:\s*auto\s*!important/);
        // 과거 버그: `margin-bottom: !important` (value 없음).
        expect(out.css).not.toMatch(/margin-\w+:\s*!important/);
    });

    it('#8 `$` inside string literal is preserved, not treated as token', () => {
        const source = src(`const cls = css({ ':before': { content: '"$5"' } });`);
        const out = transform({ source, filename: '/R8.tsx' });
        expect(out.errors).toEqual([]);
        expect(out.css).toMatch(/content:\s*"\$5"/);
    });
});

// css() 는 순수 string 을 반환한다. 같은 파일에서 정적으로 풀리는 인자는 compile-time 에
// 한 블록으로 병합하고, 그 밖의 인자는 _cx([...]) 로 이어붙인다.
describe('transform — a style object can never reach css() at runtime', () => {
    const run = (body: string) => transform({ source: src(body), filename: '/R.tsx' });

    it.each([
        ['|| object', `export const f = (c) => css(c || { color: 'red' });`, `{ color: 'red' }`],
        ['?? object', `export const f = (c) => css(c ?? { color: 'red' });`, `{ color: 'red' }`],
        ['object ||', `export const f = (c) => css({ color: 'red' } || c);`, `{ color: 'red' }`],
        [
            'ternary, one runtime branch',
            `export const f = (c, k) => css(c ? { color: 'red' } : k);`,
            `{ color: 'red' }`,
        ],
        [
            '|| object constant',
            `const base = { color: 'red' };\nexport const f = (c) => css(c || base);`,
            'base',
        ],
        [
            'nested in && right',
            `export const f = (c, k) => css(c && (k || { color: 'red' }));`,
            `{ color: 'red' }`,
        ],
    ])('%s → build error at the object', (_, body, at) => {
        const out = run(body);
        expect(out.errors).toHaveLength(1);
        expect(out.errors[0]).toMatchObject({ code: 'invalid-input-shape' });
        const source = src(body);
        const line = source.slice(0, source.indexOf(at, source.indexOf('css('))).split('\n').length;
        expect(out.errors[0]!.loc.line).toBe(line);
    });

    it.each([
        [
            'class string ||',
            `const a = css({ color: 'red' });\nexport const f = (c) => css(c || a);`,
        ],
        ['object passed to a function', `export const f = (pick) => css(pick({ color: 'red' }));`],
        ['runtime branches only', `export const f = (c, a, b) => css(c ? a : b);`],
        [
            'shadowed object constant',
            `const base = { color: 'red' };\nexport const f = (c, base) => css(c || base);`,
        ],
    ])('%s → stays a runtime class string', (_, body) => {
        expect(run(body).errors).toEqual([]);
    });
});

describe('transform — string result & composition', () => {
    const classOf = (code: string, name = 'cls') =>
        new RegExp(`const ${name} = (.+);`).exec(code)![1];
    const blocks = (css: string | null) => css!.match(/^\s*\.\w+ \{[^}]*\}/gm) ?? [];

    it('single css({...}) → one class literal, no runtime import', () => {
        const source = src(`const cls = css({ padding: '$space-100' });`);
        const out = transform({ source, filename: '/A1.tsx' });
        expect(out.errors).toEqual([]);
        expect(classOf(out.code)).toMatch(/^'cls_\w+'$/);
        expect(blocks(out.css)).toHaveLength(1);
        expect(out.code).not.toContain('__runtime__');
    });

    it('one call = one block holding all declarations in source order', () => {
        const source = src(
            `const cls = css({ color: '$fg-primary', gap: '0', ':hover': { color: '$fg-secondary' } });`,
        );
        const out = transform({ source, filename: '/A1b.tsx' });
        expect(out.css).toMatch(/\.cls_\w+ \{ color: [^;]+; gap: 0; \}\s*\.cls_\w+:hover \{/);
    });

    it('css(a, b) of imported references → _cx([a, b]) + runtime import', () => {
        const source = [
            `import { css } from '@vapor-ui/style-macro';`,
            `import { base } from './base';`,
            `import { override } from './override';`,
            `const cls = css(base, override);`,
        ].join('\n');
        const out = transform({ source, filename: '/A2.tsx' });
        expect(out.errors).toEqual([]);
        expect(out.code).toMatch(/_cx\(\[\s*base\s*,\s*override\s*\]\)/);
        expect(out.code).toMatch(
            /import\s*\{[^}]*\b_cx\b[^}]*\}\s*from\s*'@vapor-ui\/style-macro\/__runtime__'/,
        );
        expect(out.css).toBeNull();
    });

    it('css(style, ref) — local block keeps the argument position', () => {
        const source = [
            `import { css } from '@vapor-ui/style-macro';`,
            `import { base } from './base';`,
            `const cls = css({ paddingTop: '$space-300' }, base);`,
        ].join('\n');
        const out = transform({ source, filename: '/A3.tsx' });
        expect(out.errors).toEqual([]);
        expect(out.code).toMatch(/_cx\(\[\s*'cls_\w+'\s*,\s*base\s*\]\)/);
    });

    it('css({...}, {...}) — merged into one block, later argument wins', () => {
        const source = src(
            `const cls = css({ paddingTop: '$space-100', color: '$fg-primary' }, { paddingTop: '$space-300' });`,
        );
        const out = transform({ source, filename: '/A3b.tsx' });
        expect(out.errors).toEqual([]);
        expect(classOf(out.code)).toMatch(/^'cls_\w+'$/);
        expect(blocks(out.css)).toHaveLength(1);
        expect(out.css).toMatch(/color: [^;]+; padding-top: var\(--vapor-size-space-300\);/);
        expect(out.css).not.toContain('space-100');
    });

    it('same-file css() constants are merged at compile time', () => {
        const source = src(
            [
                `const base = css({ color: '$fg-normal', gap: '0' });`,
                `const active = css({ color: '$fg-primary' });`,
                `const cls = css(base, active);`,
            ].join('\n'),
        );
        const out = transform({ source, filename: '/A4.tsx' });
        expect(out.errors).toEqual([]);
        expect(classOf(out.code)).toMatch(/^'cls_\w+'$/);
        const merged = out.css!.match(/\.cls_\w+ \{[^}]*\}/)![0];
        expect(merged).toContain('gap: 0;');
        expect(merged).toContain('var(--vapor-color-foreground-primary)');
        expect(merged).not.toContain('normal');
    });

    it('conditional composition of same-file constants → a merged block per branch', () => {
        const source = [
            `import { css } from '@vapor-ui/style-macro';`,
            `const active = css({ color: '$fg-primary' });`,
            `const base = css({ color: '$fg-normal' });`,
            `const Cmp = ({ on }) => <div className={css(base, on && active)} />;`,
        ].join('\n');
        const out = transform({ source, filename: '/A5.tsx' });
        expect(out.errors).toEqual([]);
        // 정의 순서와 무관하게 active 를 고른 분기는 active 의 color 를 가진다.
        const m = /className=\{\(on \? '(div_\w+)' : '(div_\w+)'\)\}/.exec(out.code);
        expect(m).not.toBeNull();
        const onBlock = new RegExp(`\\.${m![1]} \\{[^}]*\\}`).exec(out.css!)![0];
        const offBlock = new RegExp(`\\.${m![2]} \\{[^}]*\\}`).exec(out.css!)![0];
        expect(onBlock).toContain('foreground-primary');
        expect(offBlock).toContain('foreground-normal');
        expect(out.code).not.toContain('_cx');
    });

    it('ternary between same-file constants is resolved at compile time', () => {
        const source = src(
            [
                `const a = css({ color: '$fg-primary' });`,
                `const b = css({ color: '$fg-secondary' });`,
                `const cls = css({ gap: '0' }, on ? a : b);`,
            ].join('\n'),
        );
        const out = transform({ source, filename: '/A5b.tsx' });
        expect(out.errors).toEqual([]);
        expect(classOf(out.code)).toMatch(/^\(on \? 'cls_\w+' : 'cls_\w+'\)$/);
    });

    it('mixes same-file merge with an external reference', () => {
        const source = [
            `import { css } from '@vapor-ui/style-macro';`,
            `import { ext } from './ext';`,
            `const base = css({ gap: '0' });`,
            `const cls = css(base, ext, { color: 'red' });`,
        ].join('\n');
        const out = transform({ source, filename: '/A5c.tsx' });
        expect(out.errors).toEqual([]);
        expect(classOf(out.code)).toMatch(/^_cx\(\['cls_\w+', ext\]\)$/);
        const merged = out.css!.match(/\.cls_\w+ \{[^}]*\}/)![0];
        expect(merged).toContain('gap: 0;');
        expect(merged).toContain('color: red;');
    });

    it('does not merge a shadowed name — treats it as an external reference', () => {
        const source = [
            `import { css } from '@vapor-ui/style-macro';`,
            `const base = css({ gap: '0' });`,
            `const Cmp = ({ base }) => <div className={css(base, { color: 'red' })} />;`,
        ].join('\n');
        const out = transform({ source, filename: '/A5d.tsx' });
        expect(out.errors).toEqual([]);
        expect(out.code).toMatch(/_cx\(\[base, 'div_\w+'\]\)/);
    });

    it('props-driven references stay as runtime _cx', () => {
        const source = [
            `import { css } from '@vapor-ui/style-macro';`,
            `const Cmp = ({ className }) => <div className={css({ gap: '0' }, className)} />;`,
        ].join('\n');
        const out = transform({ source, filename: '/A5e.tsx' });
        expect(out.code).toMatch(/className=\{_cx\(\['div_\w+', className\]\)\}/);
    });

    it('rejects more than 16 branch combinations', () => {
        const conds = Array.from({ length: 5 }, (_, i) => `c${i} && a${i}`).join(', ');
        const consts = Array.from(
            { length: 5 },
            (_, i) => `const a${i} = css({ order: ${i} });`,
        ).join('\n');
        const out = transform({
            source: src(`${consts}\nconst cls = css(${conds});`),
            filename: '/A5f.tsx',
        });
        expect(out.errors[0]?.message).toMatch(/32 conditional style combinations/);
    });

    it('same declarations in different files get different classes', () => {
        const source = src(`const cls = css({ gap: '0' });`);
        const a = transform({ source, filename: '/a.tsx', hash: true });
        const b = transform({ source, filename: '/b.tsx', hash: true });
        expect(classOf(a.code)).not.toBe(classOf(b.code));
    });

    it('scope option replaces filename in the hash (machine-independent)', () => {
        const source = src(`const cls = css({ gap: '0' });`);
        const a = transform({ source, filename: '/home/a/x.tsx', scope: 'src/x.tsx', hash: true });
        const b = transform({ source, filename: '/ci/b/x.tsx', scope: 'src/x.tsx', hash: true });
        expect(classOf(a.code)).toBe(classOf(b.code));
        expect(classOf(a.code)).toMatch(/^'v\w+'$/);
    });

    it('layer option wraps the module CSS', () => {
        const out = transform({
            source: src(`const cls = css({ gap: '0' });`),
            filename: '/L.tsx',
            layer: 'vapor-composites',
        });
        expect(out.css).toMatch(/@layer vapor-composites \{/);
    });

    it('className={base} — local reference stays as is', () => {
        const source = [
            `import { css } from '@vapor-ui/style-macro';`,
            `const base = css({ color: '$fg-primary' });`,
            `const Cmp = () => <div className={base} />;`,
        ].join('\n');
        const out = transform({ source, filename: '/A6.tsx' });
        expect(out.errors).toEqual([]);
        expect(out.code).toMatch(/className=\{\s*base\s*\}/);
    });

    it('inline className={css({...})} → literal named after the JSX element', () => {
        const source = [
            `import { css } from '@vapor-ui/style-macro';`,
            `const Cmp = () => <Box.Root className={css({ padding: '$space-100' })} />;`,
        ].join('\n');
        const out = transform({ source, filename: '/A7.tsx' });
        expect(out.errors).toEqual([]);
        expect(out.code).toMatch(/className=\{\s*'Root_\w+'\s*\}/);
    });

    it('template literal join of two css() results — allowed, joins classes without merging', () => {
        const source = src(
            `const base = css({ padding: '$space-100' });` +
                `const override = css({ paddingTop: '$space-300' });` +
                `const cls = \`\${base} \${override}\`;`,
        );
        const out = transform({ source, filename: '/A8.tsx' });
        expect(out.errors).toEqual([]);
        expect(out.code).toMatch(/const cls = `\$\{base\} \$\{override\}`;/);
    });

    it.each([
        [
            'imported classes',
            `import { base } from './base';\nconst Cmp = () => <div className={\`\${base} \${other}\`} />;`,
        ],
        [
            'unrelated props',
            `const Cmp = ({ variant, className }) => <div className={\`\${variant} \${className}\`} />;\nexport const x = css({ gap: 0 });`,
        ],
        [
            'props shadowing css() constants',
            `const a = css({ color: 'red' });\nconst b = css({ color: 'blue' });\nconst Cmp = ({ a, b }) => <span title={\`\${a}-\${b}\`} />;`,
        ],
    ])('className template literal with %s — no build error', (_label, body) => {
        expect(transform({ source: src(body), filename: '/A9.tsx' }).errors).toEqual([]);
    });

    it('className template with 1 vapor identifier + plain string — allowed', () => {
        const source = [
            `import { css } from '@vapor-ui/style-macro';`,
            `const cls = css({ color: '$fg-primary' });`,
            `const Cmp = ({ on }) => <div className={on ? \`\${cls} active\` : cls} />;`,
        ].join('\n');
        const out = transform({ source, filename: '/A10.tsx' });
        expect(out.errors).toEqual([]);
    });

    it('no css import → untouched', () => {
        const source = `const css = (x) => x; const cls = css({ gap: '0' });`;
        const out = transform({
            source: `// @vapor-ui/style-macro\n${source}`,
            filename: '/A11.tsx',
        });
        expect(out.css).toBeNull();
    });
});

describe('transform — cssImport (per-module CSS import)', () => {
    const run = (source: string) =>
        transform({ source, filename: '/x/a.tsx', cssImport: './a.tsx.vapor.css' });

    it('inserts the side-effect import after the last import statement', () => {
        const out = run(
            [
                `import { css } from '@vapor-ui/style-macro';`,
                `import { Box } from './box';`,
                `export const a = css({ color: 'red' });`,
            ].join('\n'),
        );
        const lines = out.code.split('\n');
        expect(lines.indexOf(`import './a.tsx.vapor.css';`)).toBe(
            lines.findIndex((l) => l.startsWith(`import { Box }`)) + 1,
        );
    });

    it('keeps a leading directive first', () => {
        const out = run(
            [
                `'use client';`,
                `import { css } from '@vapor-ui/style-macro';`,
                `export const a = css({ color: 'red' });`,
            ].join('\n'),
        );
        expect(out.code.startsWith(`'use client';`)).toBe(true);
        expect(out.code).toContain(`import './a.tsx.vapor.css';`);
    });

    it('does not insert when the module emits no CSS', () => {
        const out = run(
            [
                `import { css } from '@vapor-ui/style-macro';`,
                `import { b } from './b';`,
                `export const a = css(b);`,
            ].join('\n'),
        );
        expect(out.css).toBeNull();
        expect(out.code).not.toContain('vapor.css');
    });

    it('does not insert without the option', () => {
        const out = transform({
            source: [
                `import { css } from '@vapor-ui/style-macro';`,
                `export const a = css({ color: 'red' });`,
            ].join('\n'),
            filename: '/x/a.tsx',
        });
        expect(out.code).not.toContain('vapor.css');
    });
});

describe('transform — dynamic slots follow the className branch tree (PR #752 review)', () => {
    const run = (expr: string) =>
        transform({
            source: src(`export const A = ({ item, on, a, b }) => <div className={${expr}} />;`),
            filename: '/G.tsx',
        });
    const styleOf = (code: string) => /style=\{\{ (.+) \}\} \/>/.exec(code)![1];
    const SLOT = String.raw`'--vapor-_\w+': _resolveToken\(__vaporAxis_\w+, `;

    describe('call-site guards (outside css())', () => {
        it('`a && css({ x: a.v })` evaluates the slot only when `a` is truthy', () => {
            const out = run(`item && css({ backgroundColor: item.color })`);
            expect(out.errors).toEqual([]);
            expect(styleOf(out.code)).toMatch(
                new RegExp(
                    String.raw`^\.\.\.\(\(item\) \? \{ ${SLOT}item\.color, 'px'\) \?\? 'var\(--vapor-_\w+,\)' \} : \{\}\)$`,
                ),
            );
        });

        it('ternary guards each branch with its own condition', () => {
            const style = styleOf(run(`on ? css({ color: a.c }) : css({ color: b.c })`).code);
            expect(style).toMatch(new RegExp(String.raw`\.\.\.\(\(on\) \? \{ ${SLOT}a\.c`));
            expect(style).toMatch(new RegExp(String.raw`\.\.\.\(!\(on\) \? \{ ${SLOT}b\.c`));
        });

        it('`||` and `??` guard the right operand with the negated left', () => {
            expect(styleOf(run(`a || css({ color: b.c })`).code)).toContain(`...(!(a) ? {`);
            expect(styleOf(run(`a ?? css({ color: b.c })`).code)).toContain(`...((a) == null ? {`);
        });

        it('nested guards evaluate outermost first', () => {
            const style = styleOf(run(`a && (b ? css({ color: item.c }) : 'x')`).code);
            expect(style).toMatch(/^\.\.\.\(\(a\) \? \(\(b\) \? \{ .+ \} : \{\}\) : \{\}\)$/);
        });

        it('left operand of `&&` is evaluated unconditionally → no guard', () => {
            expect(styleOf(run(`css({ color: item.c }) && a`).code)).toMatch(
                new RegExp(`^${SLOT}`),
            );
        });
    });

    describe('argument branches (inside css())', () => {
        it('`cond ? { x: item.v } : undefined` evaluates the slot only on the true branch', () => {
            const out = run(
                `css({ width: 100 }, item ? { backgroundColor: item.color } : undefined)`,
            );
            expect(out.errors).toEqual([]);
            expect(out.code).toMatch(/className=\{\(item \? '\w+' : '\w+'\)\}/);
            expect(styleOf(out.code)).toMatch(
                new RegExp(
                    String.raw`^\.\.\.\(item \? \{ ${SLOT}item\.color, 'px'\) .+ \} : \{\}\)$`,
                ),
            );
        });

        it('`cond && { x: item.v }` evaluates the slot only when cond is truthy', () => {
            const style = styleOf(
                run(`css({ width: 100 }, item && { backgroundColor: item.color })`).code,
            );
            expect(style).toMatch(/^\.\.\.\(item \? \{ .+ \} : \{\}\)$/);
        });

        it('slot present in both branches is not guarded', () => {
            const style = styleOf(
                run(`css({ color: item.c }, on ? { width: 1 } : { width: 2 })`).code,
            );
            expect(style).toMatch(new RegExp(`^${SLOT}item\\.c`));
        });

        it('call-site guard wraps argument branches', () => {
            const style = styleOf(run(`a && css(item ? { color: item.c } : undefined)`).code);
            expect(style).toMatch(/^\.\.\.\(\(a\) \? \(item \? \{ .+ \} : \{\}\) : \{\}\)$/);
        });

        it('dynamic value overridden by a later static declaration is never evaluated', () => {
            const out = run(`css({ color: item.c }, { color: 'red' })`);
            expect(out.errors).toEqual([]);
            expect(out.code).not.toContain('style=');
            expect(out.code).not.toContain('item.c');
        });
    });
});

describe('transform — plain style object constants (PR #752 review)', () => {
    const body = (decl: string, use = `css(base, { color: 'red' })`) =>
        src(`${decl}\nexport const A = () => <div className={${use}} />;`);

    it('module-level `const x = { ... }` merges at compile time like a css() constant', () => {
        const out = transform({
            source: body(`const base = { padding: '$space-200' };`),
            filename: '/O1.tsx',
        });
        expect(out.errors).toEqual([]);
        expect(out.code).not.toContain('_cx');
        expect(out.code).toMatch(/className=\{'\w+'\}/);
        expect(out.css).toContain('padding-top: var(--vapor-size-space-200)');
        expect(out.css).toContain('color: red');
    });

    it('accepts `export const`, `as const` and `satisfies` wrappers', () => {
        for (const decl of [
            `export const base = { padding: '$space-200' };`,
            `const base = { padding: '$space-200' } as const;`,
            `const base = { padding: '$space-200' } satisfies Record<string, string>;`,
        ]) {
            const out = transform({ source: body(decl), filename: '/O2.tsx' });
            expect(out.errors).toEqual([]);
            expect(out.css).toContain('padding-top');
        }
    });

    it('later argument wins over the constant', () => {
        const out = transform({
            source: body(`const base = { color: 'blue' };`, `css(base, { color: 'red' })`),
            filename: '/O3.tsx',
        });
        expect(out.css).toContain('color: red');
        expect(out.css).not.toContain('color: blue');
    });

    it('shadowed name stays a runtime part', () => {
        const out = transform({
            source: src(
                `const base = { color: 'blue' };\nexport const A = ({ base }) => <div className={css(base, { color: 'red' })} />;`,
            ),
            filename: '/O4.tsx',
        });
        expect(out.code).toContain('_cx([base,');
    });
});

describe('transform — module constants capture values at definition (PR #752 review)', () => {
    it('branch test of a constant is captured, not re-read in the use-site scope', () => {
        const out = transform({
            source: src(
                `const compact = false;\nconst base = css({ padding: compact ? '4px' : '16px' });\n` +
                    `export const A = ({ compact }) => <div className={css(base, { color: 'red' })} />;`,
            ),
            filename: '/S1.tsx',
        });
        expect(out.errors).toEqual([]);
        const capture = /const (__vaporCapture_\d+) = \(compact\);\nconst base =/.exec(out.code);
        expect(capture).not.toBeNull();
        expect(out.code).toMatch(
            new RegExp(`className=\\{\\(${capture![1]} \\? '\\w+' : '\\w+'\\)\\}`),
        );
    });

    it('dynamic value of a constant is captured, not re-read in the use-site scope', () => {
        const out = transform({
            source: src(
                `const theme = { c: 'red' };\nconst base = { color: theme.c };\n` +
                    `export const A = ({ theme }) => <div className={css(base)} />;`,
            ),
            filename: '/S2.tsx',
        });
        expect(out.errors).toEqual([]);
        const capture = /const (__vaporCapture_\d+) = \(theme\.c\);\nconst base =/.exec(out.code);
        expect(capture).not.toBeNull();
        expect(out.code).toContain(`_resolveToken(__vaporAxis_color, ${capture![1]}, 'px')`);
    });

    it('nested constants capture once at their own definition', () => {
        const out = transform({
            source: src(
                `const a = css({ color: x ? 'red' : 'blue' });\nconst b = css(a, { width: 1 });\n` +
                    `export const A = () => <div className={css(b)} />;\nexport const B = () => <div className={css(a)} />;`,
            ),
            filename: '/S3.tsx',
        });
        expect(out.errors).toEqual([]);
        expect(out.code.match(/= \(x\);/g)).toHaveLength(1);
    });

    describe('capture sits right before its declarator (same evaluation order)', () => {
        const run = (decl: string) => {
            const out = transform({
                source: src(`${decl}\nexport const A = () => <div className={css(base)} />;`),
                filename: '/S5.tsx',
            });
            expect(out.errors).toEqual([]);
            return out.code;
        };
        const exportedNames = (code: string) =>
            parseSync('/o.tsx', code, {
                sourceType: 'module',
                lang: 'tsx',
            }).module.staticExports.flatMap((e) => e.entries.map((x) => x.exportName.name));

        it('splits the declaration so earlier declarators are initialized first', () => {
            const code = run(`const w = getW(), base = { width: w, height: h ? '1px' : '2px' };`);
            expect(code).toMatch(
                /const w = getW\(\);\nconst __vaporCapture_0 = \(w\);\nconst __vaporCapture_1 = \(h\);\nconst base = \{ width: __vaporCapture_0/,
            );
        });

        it('keeps `export` on each split declarator and does not export the capture', () => {
            const code = run(`export const w = getW(), base = { width: w };`);
            expect(code).toMatch(
                /export const w = getW\(\);\nconst __vaporCapture_0 = \(w\);\nexport const base = /,
            );
            expect(exportedNames(code).sort()).toEqual(['A', 'base', 'w']);
        });

        it('does not split when the constant is the first declarator', () => {
            const code = run(`const base = { width: w }, other = 1;`);
            expect(code).toMatch(
                /const __vaporCapture_0 = \(w\);\nconst base = \{ width: __vaporCapture_0 \}, other = 1;/,
            );
        });
    });

    it('inline arguments are not captured', () => {
        const out = transform({
            source: src(
                `export const A = ({ on }) => <div className={css({ color: on ? 'red' : 'blue' })} />;`,
            ),
            filename: '/S4.tsx',
        });
        expect(out.code).not.toContain('__vaporCapture_');
    });
});

describe('transform — parse language and parse errors (PR #752 review)', () => {
    const body = `export const cls = css({ padding: '$space-200' });`;

    it.each([
        ['/P.ts', `const id = <T,>(v: T) => v;\nconst n = <number>id(1);\n${body}`],
        ['/P.mts', `const id = <T,>(v: T) => v;\n${body}`],
        ['/P.tsx', `const id = <T,>(v: T) => v;\nconst e = <div />;\n${body}`],
        ['/P.jsx', `const e = <div />;\n${body}`],
        ['/P.js', `const e = <div />;\n${body}`],
    ])('parses %s with its own language and compiles css()', (filename, code) => {
        const out = transform({ source: src(code), filename });
        expect(out.errors).toEqual([]);
        expect(out.css).toContain('padding-top');
        expect(out.code).not.toContain('css({');
    });

    it('syntax error in a file that imports the macro is a build error with location', () => {
        const out = transform({ source: src(`const x = ;\n${body}`), filename: '/P.ts' });
        expect(out.errors).toHaveLength(1);
        expect(out.errors[0]).toMatchObject({ code: 'parse-error', loc: { line: 2 } });
    });

    it('file without the macro import is still skipped untouched', () => {
        const source = `const x = ;`;
        expect(transform({ source, filename: '/P.ts' })).toEqual({
            code: source,
            map: null,
            css: null,
            errors: [],
        });
    });
});

describe('transform — nested selectors read the element slot (PR #752 review)', () => {
    it.each([
        [`{ '::before': { backgroundColor: c } }`, '::before'],
        [`{ '& > span': { width: w } }`, '> span'],
    ])('%s emits var() without blocking inheritance', (style, selector) => {
        const out = transform({
            source: src(`export const A = ({ c, w }) => <div className={css(${style})} />;`),
            filename: '/N.tsx',
        });
        expect(out.errors).toEqual([]);
        expect(out.css).toContain(selector);
        expect(out.css).toMatch(/var\(--vapor-_\w+\)/);
        expect(out.css).not.toContain('@property');
    });
});

describe('transform — mutation of merged object constants is a build error', () => {
    const run = (body: string) => transform({ source: src(body), filename: '/M.tsx' });
    const use = `export const A = () => <div className={css(base)} />;`;

    it.each([
        ['member assignment', `base.width = '96px';`],
        ['computed member assignment', `base['width'] = '96px';`],
        ['nested member assignment', `base[':hover'].color = 'red';`],
        ['compound assignment', `base.width += 'x';`],
        ['update expression', `base.count++;`],
        ['delete', `delete base.width;`],
        ['Object.assign target', `Object.assign(base, { width: '96px' });`],
        [
            'Object.defineProperty target',
            `Object.defineProperty(base, 'width', { value: '96px' });`,
        ],
        ['Reflect.set target', `Reflect.set(base, 'width', '96px');`],
        ['non-null wrapped', `base![':hover']!.color = 'red';`],
        ['mutation after use', null],
    ])('%s → mutated-constant error at the mutation line', (_label, stmt) => {
        const decl = `const base = { width: '24px', ':hover': { color: 'blue' } };`;
        const body =
            stmt === null ? `${decl}\n${use}\nbase.width = '96px';` : `${decl}\n${stmt}\n${use}`;
        const out = run(body);
        expect(out.errors).toHaveLength(1);
        expect(out.errors[0]).toMatchObject({
            code: 'mutated-constant',
            loc: { line: stmt === null ? 4 : 3 },
        });
        expect(out.errors[0]!.message).toContain('base');
    });

    it.each([
        ['read', `console.log(base.width);`],
        ['passed as value', `const box = <Box $css={base} />;`],
        ['Object.assign source (not target)', `const copy = Object.assign({}, base);`],
        ['export', null],
        ['different object mutated', `const other = { width: 1 };\nother.width = 2;`],
    ])('%s → no error, still merged', (_label, stmt) => {
        const decl =
            stmt === null
                ? `export const base = { width: '24px' };`
                : `const base = { width: '24px' };\n${stmt}`;
        const out = run(`${decl}\n${use}`);
        expect(out.errors).toEqual([]);
        expect(out.code).toMatch(/className=\{'\w+'\}/);
    });

    it('mutating a same-named local in another scope is not reported', () => {
        const out = run(
            `const base = { width: '24px' };\nfunction f() { const base = { width: 1 }; base.width = 2; }\n${use}`,
        );
        expect(out.errors).toEqual([]);
    });

    it('mutating a constant that is not merged into css() is ignored', () => {
        const out = run(
            `const cfg = { width: '24px' };\ncfg.width = '96px';\n${`export const A = () => <div className={css({ color: 'red' })} />;`}`,
        );
        expect(out.errors).toEqual([]);
    });

    it('mutating a css() constant result is not checked (it is a string)', () => {
        const out = run(`const base = css({ width: '24px' });\n${use}`);
        expect(out.errors).toEqual([]);
    });
});

describe('transform — captured expressions are evaluated once (moved, not copied)', () => {
    const run = (body: string) => transform({ source: src(body), filename: '/E.tsx' });
    const count = (code: string, needle: string) => code.split(needle).length - 1;

    it('css() constant: definition and every use read the one capture', () => {
        const out = run(
            `const base = css({ color: tick() ? 'red' : 'blue' });\n` +
                `export const A = () => <div className={css(base)} />;\n` +
                `export const B = () => <div className={css(base, { width: 1 })} />;`,
        );
        expect(out.errors).toEqual([]);
        expect(count(out.code, 'tick()')).toBe(1);
        expect(out.code).toMatch(
            /const __vaporCapture_0 = \(tick\(\)\);\nconst base = \(__vaporCapture_0 \? '\w+' : '\w+'\);/,
        );
    });

    it('object constant: the literal keeps its shape but reads the capture', () => {
        const out = run(
            `const base = { color: tick() ? 'red' : 'blue', width: theme.w };\n` +
                `export const A = () => <div className={css(base)} />;\nconsole.log(base.width);`,
        );
        expect(out.errors).toEqual([]);
        expect(count(out.code, 'tick()')).toBe(1);
        expect(count(out.code, 'theme.w')).toBe(1);
        expect(out.code).toMatch(
            /const base = \{ color: __vaporCapture_\d+ \? 'red' : 'blue', width: __vaporCapture_\d+ \};/,
        );
    });

    it('nested constants: each expression is hoisted once before its own definition', () => {
        const out = run(
            `const a = css({ color: x() ? 'red' : 'blue' });\nconst b = css(a, { width: 1 });\n` +
                `export const A = () => <div className={css(b)} />;\nexport const B = () => <div className={css(a)} />;`,
        );
        expect(out.errors).toEqual([]);
        expect(count(out.code, 'x()')).toBe(1);
        expect(out.code.indexOf('= (x());')).toBeLessThan(out.code.indexOf('const a ='));
    });

    it('object constant referenced by a css() constant', () => {
        const out = run(
            `const o = { color: x() ? 'red' : 'blue' };\nconst c = css(o, { width: 1 });\n` +
                `export const A = () => <div className={css(c)} />;`,
        );
        expect(out.errors).toEqual([]);
        expect(count(out.code, 'x()')).toBe(1);
    });

    it('constant never merged locally keeps its source and adds no capture', () => {
        const out = run(`export const base = css({ color: tick() ? 'red' : 'blue' });`);
        expect(count(out.code, 'tick()')).toBe(1);
        expect(out.code).not.toContain('__vaporCapture_');
    });
});

describe('transform — slots merge into the element final style (spreads, callbacks)', () => {
    const run = (jsx: string) =>
        transform({
            source: src(`export const A = ({ c, s, k, rest, other }) => ${jsx};`),
            filename: '/T3.tsx',
        });

    it('no user style source → plain style attribute', () => {
        const out = run(`<div className={css({ color: c })} />`);
        expect(out.code).toMatch(/className=\{'\w+'\} style=\{\{ '--vapor-_\w+': .+ \}\} \/>/);
        expect(out.code).not.toContain('_mergeStyle');
    });

    it('single explicit style attribute → merged in place through _mergeStyle', () => {
        const out = run(`<div style={s} className={css({ color: c })} />`);
        expect(out.errors).toEqual([]);
        expect(out.code).toMatch(
            /style=\{_mergeStyle\(\{ '--vapor-_\w+': .+ \}, \(s\)\)\} className=/,
        );
        expect(out.code).toMatch(
            /import \{[^}]*\b_mergeStyle\b[^}]*\} from '@vapor-ui\/style-macro\/__runtime__'/,
        );
    });

    it.each([
        [
            'spread after className',
            `<div className={css({ color: c })} {...rest} />`,
            /<div className=\{'\w+'\} \{\.\.\._withStyle\(\{ '--vapor-_\w+': .+ \}, \{ \.\.\.rest \}\)\} \/>/,
        ],
        [
            'style before spread',
            `<div className={css({ color: c })} style={s} {...rest} />`,
            /<div className=\{'\w+'\} \{\.\.\._withStyle\(\{ .+ \}, \{ "style": s, \.\.\.rest \}\)\} \/>/,
        ],
        [
            'two spreads around className',
            `<div {...rest} className={css({ color: c })} {...other} />`,
            /<div \{\.\.\._withStyle\(\{ .+ \}, \{ \.\.\.rest, "className": '\w+', \.\.\.other \}\)\} \/>/,
        ],
    ])(
        '%s → only the style-deciding region becomes one _withStyle spread',
        (_label, jsx, shape) => {
            const out = run(jsx);
            expect(out.errors).toEqual([]);
            expect(out.code).toMatch(shape);
            expect(out.code).not.toMatch(/ style=/);
        },
    );

    it('attributes outside the region stay JSX; inside keep order and value kinds', () => {
        const out = run(
            `<div id="x" title="a &amp; b" {...rest} disabled aria-label={k} data-v="y" {...other} onClick={() => 1} className={css({ color: c })} />`,
        );
        expect(out.errors).toEqual([]);
        expect(out.code).toContain(`<div id="x" title="a &amp; b" {..._withStyle(`);
        expect(out.code).toContain(
            `{ ...rest, "disabled": true, "aria-label": k, "data-v": "y", ...other })} onClick={() => 1} className=`,
        );
    });

    it('HTML entity in a string between spreads is a build error', () => {
        const out = run(
            `<div {...rest} title="a &amp; b" {...other} className={css({ color: c })} />`,
        );
        expect(out.errors[0]?.message).toContain('HTML entities');
    });

    it('key inside the region stays an explicit attribute in front', () => {
        const out = run(`<div {...rest} key={k} {...other} className={css({ color: c })} />`);
        expect(out.code).toMatch(/<div key=\{k\} \{\.\.\._withStyle\(/);
        expect(out.code).not.toContain('"key"');
    });

    it('string style attribute is still a build error', () => {
        const out = run(`<div style="color: red" className={css({ color: c })} />`);
        expect(out.errors[0]?.code).toBe('dynamic-value');
    });
});

describe('transform — only calls that reference the imported binding are macros', () => {
    const run = (body: string) => transform({ source: src(body), filename: '/B.tsx' });

    it.each([
        ['parameter', `export function f(css) { return css({ color: 'red' }); }`],
        [
            'local const',
            `export function f() { const css = (o) => o; return css({ color: 'red' }); }`,
        ],
        ['destructured', `export const f = ({ css }) => css({ color: 'red' });`],
        ['catch param', `try {} catch (css) { css({ color: 'red' }); }`],
        ['block let', `{ let css = (o) => o; css({ color: 'red' }); }`],
    ])('leaves a shadowed `css` untouched: %s', (_, body) => {
        const out = run(body);
        expect(out.errors).toEqual([]);
        expect(out.code).toContain(`css({ color: 'red' })`);
        expect(out.css ?? '').toBe('');
    });

    it('compiles the module binding next to a shadowed one', () => {
        const out = run(
            `export const a = css({ color: 'blue' });\nexport function f(css) { return css({ color: 'red' }); }`,
        );
        expect(out.errors).toEqual([]);
        expect(out.code).toContain(`css({ color: 'red' })`);
        expect(out.css).toContain('color: blue');
        expect(out.css).not.toContain('color: red');
    });

    it('a shadowed `css` inside a macro argument is not a nested macro call', () => {
        const out = run(`export const a = css({ color: 'red' }, pick((css) => css(y)));`);
        expect(out.errors).toEqual([]);
        expect(out.code).toContain('(css) => css(y)');
    });
});

describe('transform — module constants resolve by lexical scope, not by name count', () => {
    const run = (body: string) => transform({ source: src(body), filename: '/S.tsx' });
    const use = `export const A = () => <div className={css(base, { color: 'red' })} />;`;

    it.each([
        ['object constant', `const base = { width: '24px' };`],
        ['css() constant', `const base = css({ width: '24px' });`],
    ])('%s merges although another function declares the same name', (_label, decl) => {
        const out = run(`${decl}\nfunction other() { const base = 1; return base; }\n${use}`);
        expect(out.errors).toEqual([]);
        expect(out.code).not.toContain('_cx');
        expect(out.code).toMatch(/className=\{'\w+'\}/);
    });

    it('still a runtime part where the name is shadowed at the call site', () => {
        const out = run(
            `const base = { width: '24px' };\nexport const A = ({ base }) => <div className={css(base, { color: 'red' })} />;`,
        );
        expect(out.code).toContain('_cx([base,');
    });

    it('the same constant merges in one component and stays runtime in another', () => {
        const out = run(
            `const base = { width: '24px' };\n${use}\nexport const B = ({ base }) => <div className={css(base)} />;`,
        );
        expect(out.errors).toEqual([]);
        expect(out.code).toMatch(/const A = \(\) => <div className=\{'\w+'\} \/>/);
        expect(out.code).toContain('className={_cx([base])}');
    });

    it('mutating a same-named local elsewhere is not reported', () => {
        const out = run(
            `const base = { width: '24px' };\nfunction f() { const base = { width: 1 }; base.width = 2; Object.assign(base, {}); }\n${use}`,
        );
        expect(out.errors).toEqual([]);
        expect(out.code).not.toContain('_cx');
    });

    it('mutating the module constant from inside a function is reported', () => {
        const out = run(
            `const base = { width: '24px' };\nfunction f() { base.width = '96px'; }\n${use}`,
        );
        expect(out.errors[0]).toMatchObject({ code: 'mutated-constant', loc: { line: 3 } });
    });
});

describe('transform — literal values that can never be CSS', () => {
    const run = (style: string) =>
        transform({
            source: src(`export const A = ({ c }) => <div className={css(${style})} />;`),
            filename: '/V.tsx',
        });

    it.each([
        ['boolean', `{ color: true }`, 'a boolean'],
        ['boolean in nested selector', `{ ':hover': { display: false } }`, 'a boolean'],
        ['regex', `{ color: /x/ }`, 'a regular expression'],
        ['bigint', `{ width: 10n }`, 'a BigInt'],
        ['array', `{ margin: [1, 2] }`, 'an array'],
        ['arrow function', `{ color: () => 'red' }`, 'a function'],
        ['function expression', `{ color: function () { return 'red'; } }`, 'a function'],
        ['class expression', `{ color: class {} }`, 'a class'],
        ['wrapped in as / parens', `{ color: (true as never) }`, 'a boolean'],
    ])('%s → invalid-value build error', (_label, style, kind) => {
        const out = run(style);
        expect(out.errors).toHaveLength(1);
        expect(out.errors[0]!.code).toBe('invalid-value');
        expect(out.errors[0]!.message).toContain(kind);
    });

    it('non-style object constant is reported through its values', () => {
        const out = transform({
            source: src(
                `const opts = { enabled: true, retries: 3 };\nexport const A = () => <div className={css(opts)} />;`,
            ),
            filename: '/V2.tsx',
        });
        expect(out.errors.map((e) => e.code)).toEqual(['invalid-value']);
    });

    it.each([
        ['null', `{ color: null, width: '1px' }`],
        ['undefined', `{ color: undefined, width: '1px' }`],
        ['null in nested selector', `{ ':hover': { color: null }, width: '1px' }`],
        ['null wrapped in as', `{ color: null as never, width: '1px' }`],
    ])('%s → declaration omitted, no slot', (_label, style) => {
        const out = run(style);
        expect(out.errors).toEqual([]);
        expect(out.css).not.toContain('color');
        expect(out.css).toContain('width: 1px');
        expect(out.code).not.toContain('style=');
    });

    it.each([
        [`{ '--gap': 4 }`, '--gap: 4;'],
        [`{ '--my-color': 0.5 }`, '--my-color: 0.5;'],
        [`{ '--myColor': 4 }`, '--myColor: 4;'],
    ])('a number on a custom property gets no unit, as with React style: %s', (style, decl) => {
        const out = run(style);
        expect(out.errors).toEqual([]);
        expect(out.css).toContain(decl);
    });

    it('only-null object emits no block and no class', () => {
        const out = run(`{ color: null }`);
        expect(out.errors).toEqual([]);
        expect(out.code).toContain(`className={''}`);
    });

    it.each([
        ['dynamic expression', `{ color: c && 'red' }`],
        ['binary expression', `{ width: c + 'px' }`],
        ['call', `{ color: String(c) }`],
        ['custom property', `{ '--x': c }`],
    ])('%s → still a dynamic slot', (_label, style) => {
        const out = run(style);
        expect(out.errors).toEqual([]);
        expect(out.code).toContain('style=');
    });
});

describe('transform — every build error points at its node', () => {
    // 2행에 한글·이모지 주석 — offset 은 UTF-16 기준이어야 column 이 맞는다.
    const at = (line3: string) =>
        transform({
            source: [`import { css } from '@vapor-ui/style-macro';`, `// 한글 주석 😀`, line3].join(
                '\n',
            ),
            filename: '/L.tsx',
        }).errors[0]!;
    const col = (line3: string, needle: string) => line3.indexOf(needle);

    it.each([
        ['invalid-value', `export const a = css({ color: true });`, 'true'],
        ['unknown-token', `export const a = css({ color: '$nope-1' });`, `'$nope-1'`],
        ['spread', `export const a = css({ ...x });`, '...x'],
        ['computed-key', `export const a = css({ [k]: 1 });`, 'k]'],
        ['invalid-selector', `export const a = css({ hover: { color: 'red' } });`, 'hover'],
        ['dynamic-value (ternary)', `export const a = css({ color: c ? d : 'red' });`, 'c ?'],
        ['invalid-input-shape (no arg)', `export const a = css();`, 'css()'],
        ['invalid-input-shape (nested)', `export const a = css(x, css(y));`, 'css(y)'],
        [
            'dynamic-value (not className)',
            `export const A = ({ c }) => <div title={css({ color: c })} />;`,
            'css({',
        ],
    ])('%s', (_label, line3, needle) => {
        const err = at(line3);
        expect(err.loc).toEqual({ line: 3, column: col(line3, needle) });
    });

    it('code frame marks the offending line', () => {
        const out = transform({
            source: [
                `import { css } from '@vapor-ui/style-macro';`,
                ``,
                `export const a = css({ color: true });`,
            ].join('\n'),
            filename: '/L2.tsx',
        });
        expect(out.errors[0]!.loc.line).toBe(3);
    });
});
