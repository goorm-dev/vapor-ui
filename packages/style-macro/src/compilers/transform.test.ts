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
        // slot object 를 먼저, 사용자 `style` 을 뒤로 spread — 사용자 값이 slot
        // 기본값을 override 할 수 있어야 하기 때문 (리뷰 #6b).
        expect(out.code).toMatch(/\{\s*\.\.\.\{[^}]*--vapor[^}]*\}\s*,\s*\.\.\.\(myStyle\)\s*\}/);
        // helper import 는 `_resolveToken` 만 — `_mergeStyle` 은 inline spread 로 처리.
        expect(out.code).not.toContain('_mergeStyle');
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
        expect(out.code).toMatch(/\{\s*\.\.\.\{[^}]*--vapor[^}]*\}\s*,\s*\.\.\.\(myStyle\)\s*\}/);
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
        // 각 slot var 는 @property inherits:false 선언을 가져야 함.
        expect(out.css).toMatch(/@property\s+--vapor-_[^{]+\{[^}]*inherits:\s*false/);
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
            layer: 'composites',
        });
        expect(out.css).toMatch(/@layer composites \{/);
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

    it('template literal join of two css() results — build error', () => {
        const source = src(
            `const base = css({ padding: '$space-100' });` +
                `const override = css({ paddingTop: '$space-300' });` +
                `const cls = \`\${base} \${override}\`;`,
        );
        const out = transform({ source, filename: '/A8.tsx' });
        expect(out.errors.length).toBeGreaterThan(0);
        expect(out.errors[0].code).toBe('template-literal');
    });

    it('className=template-literal (2 identifiers) — build error', () => {
        const source = [
            `import { css } from '@vapor-ui/style-macro';`,
            `import { base } from './base';`,
            `import { override } from './over';`,
            `const Cmp = () => <div className={\`\${base} \${override}\`} />;`,
        ].join('\n');
        const out = transform({ source, filename: '/A9.tsx' });
        expect(out.errors.length).toBeGreaterThan(0);
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
