import { describe, expect, it } from 'vitest';

import { transform } from './transform';

const src = (body: string) => [`import { css } from '@vapor-ui/style-macro';`, body].join('\n');

describe('transform — static syntax', () => {
    it('rewrites css({ prop: literal }) to _mkStyle object', () => {
        const out = transform({
            source: src(`const cls = css({ padding: '$space-400' });`),
            filename: '/A.tsx',
        });
        expect(out.errors).toEqual([]);
        expect(out.css).toContain('padding-top');
        // 단일 object 호출 → _mkStyle({ 'base|prop': 'cls', … }) 리터럴.
        expect(out.code).toMatch(/const cls = _mkStyle\(\s*\{/);
        expect(out.code).toMatch(/'base\|padding-top'\s*:\s*'[^']+'/);
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
        // (A2 전환 후 _mkStyle 도 같은 import 안에 섞일 수 있음.)
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

    it('falls back to `{}` for properties without a token axis', () => {
        const source = [
            `import { css } from '@vapor-ui/style-macro';`,
            `function Comp({ x }) {`,
            `  return <div className={css({ 'grid-template-rows': x })} />;`,
            `}`,
        ].join('\n');
        const out = transform({ source, filename: '/O.tsx' });
        expect(out.errors).toEqual([]);
        // axis 룩업 실패 → `{}` 로 pass-through.
        expect(out.code).toMatch(/_resolveToken\(\s*\{\s*\}\s*,/);
        // axis 식별자 alias 없이 `_resolveToken` 만 (A2 전환 후 _mkStyle 는 섞일 수 있음).
        expect(out.code).toMatch(
            /import\s*\{[^}]*\b_resolveToken\b[^}]*\}\s*from\s*'@vapor-ui\/style-macro\/__runtime__'/,
        );
        expect(out.code).not.toContain('__vaporAxis_');
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
        // A2-obj: padding → padding-top/right/bottom/left 4 longhand 로 전개 되며,
        // 각 longhand 가 _mkStyle object 안에서 독립 ternary 로 분기된다.
        const source = src(`const cls = css({ padding: compact ? '$space-100' : '$space-400' });`);
        const out = transform({ source, filename: '/T2.tsx' });
        expect(out.errors).toEqual([]);
        // _mkStyle 안에 4 개의 `(compact ? 'A' : 'B')` ternary 가 들어 있어야 함.
        const ternaryCount = (out.code.match(/compact\s*\?/g) ?? []).length;
        expect(ternaryCount).toBe(4);
        // 4 개 longhand property 가 모두 등장.
        expect(out.code).toMatch(/'base\|padding-top'\s*:\s*\(/);
        expect(out.code).toMatch(/'base\|padding-right'\s*:\s*\(/);
        expect(out.code).toMatch(/'base\|padding-bottom'\s*:\s*\(/);
        expect(out.code).toMatch(/'base\|padding-left'\s*:\s*\(/);
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
        // A2-obj: static prop 과 ternary 가 모두 같은 _mkStyle object 안에 공존.
        expect(out.code).toMatch(/_mkStyle\(\s*\{/);
        expect(out.code).toMatch(/'base\|display'\s*:/);
        expect(out.code).toMatch(/'base\|color'\s*:\s*\(/);
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
        const source = src(
            `const cls = css({ padding: '$space-100', paddingTop: '$space-300' });`,
        );
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
        const source = src(
            `const cls = css({ aspectRatio: 1, gridColumn: 2, scale: 1 });`,
        );
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
        expect(out.code).toMatch(
            /\{\s*\.\.\.\{[^}]*--vapor[^}]*\}\s*,\s*\.\.\.\(myStyle\)\s*\}/,
        );
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

// Phase 7 — A2-obj red snapshot.
// css() 가 object(toString 심음) 를 반환하도록 리팩터할 새 동작의 fixture.
// Phase 9 (parse-call 치환 리팩터) 가 끝나기 전까지 전부 실패 상태로 유지.
describe('transform — A2-obj new API', () => {
    it('single css({...}) → _mkStyle({ property: className }) 치환', () => {
        const source = src(`const cls = css({ padding: '$space-100' });`);
        const out = transform({ source, filename: '/A1.tsx' });
        expect(out.errors).toEqual([]);
        // 기존: const cls = 'vapor_pt_..._pr_..._pb_..._pl_...';
        // 새 결과: const cls = _mkStyle({ 'padding-top': '...', ... });
        expect(out.code).toMatch(/_mkStyle\(\s*\{/);
        // key 는 `${selectorContext}|${property}` 복합 (리뷰 #1 last-wins 를 위한
        // slot 역할). 같은 selector 안 같은 property 끼리만 head-to-head.
        expect(out.code).toMatch(/'base\|padding-top'\s*:\s*'[^']+'/);
        expect(out.code).toMatch(/import\s*\{[^}]*_mkStyle[^}]*\}\s*from\s*'@vapor-ui\/style-macro\/__runtime__'/);
    });

    it('css(a, b) — 두 참조 머지 → _mergeStyles(a, b) 치환', () => {
        const source = [
            `import { css } from '@vapor-ui/style-macro';`,
            `import { base } from './base';`,
            `import { override } from './override';`,
            `const cls = css(base, override);`,
        ].join('\n');
        const out = transform({ source, filename: '/A2.tsx' });
        expect(out.errors).toEqual([]);
        expect(out.code).toMatch(/_mergeStyles\(\s*base\s*,\s*override\s*\)/);
    });

    it('css(style, a) — 선언 + 참조 섞인 머지', () => {
        const source = [
            `import { css } from '@vapor-ui/style-macro';`,
            `import { base } from './base';`,
            `const cls = css({ paddingTop: '$space-300' }, base);`,
        ].join('\n');
        const out = transform({ source, filename: '/A3.tsx' });
        expect(out.errors).toEqual([]);
        // 선언이 먼저 _mkStyle 로 치환된 뒤 base 와 머지.
        expect(out.code).toMatch(/_mergeStyles\(\s*_mkStyle\(\s*\{[\s\S]*?\}\s*\)\s*,\s*base\s*\)/);
    });

    it('className={base} — 지역 변수 참조는 그대로 유지 (runtime toString)', () => {
        const source = [
            `import { css } from '@vapor-ui/style-macro';`,
            `const base = css({ color: '$fg-primary' });`,
            `const Cmp = () => <div className={base} />;`,
        ].join('\n');
        const out = transform({ source, filename: '/A4.tsx' });
        expect(out.errors).toEqual([]);
        // base 가 _mkStyle(...) 로 치환되었지만 JSX attribute 는 그대로.
        // React 가 String(base) → toString() 호출.
        expect(out.code).toMatch(/className=\{\s*base\s*\}/);
    });

    it('className={css({...})} 인라인 — _mkStyle 로 치환', () => {
        const source = [
            `import { css } from '@vapor-ui/style-macro';`,
            `const Cmp = () => <div className={css({ padding: '$space-100' })} />;`,
        ].join('\n');
        const out = transform({ source, filename: '/A5.tsx' });
        expect(out.errors).toEqual([]);
        expect(out.code).toMatch(/className=\{\s*_mkStyle\(\s*\{/);
    });

    it('단일 호출 내 property last-wins — paddingTop 이 뒤에 선언되면 그것만 남김', () => {
        const source = src(
            `const cls = css({ padding: '$space-100', paddingTop: '$space-300' });`,
        );
        const out = transform({ source, filename: '/A6.tsx' });
        expect(out.errors).toEqual([]);
        // _mkStyle map 안에는 padding-top key 가 **딱 한 번**만 등장해야 함.
        // key 는 복합 `base|padding-top` 형태.
        const matches = out.code!.match(/'base\|padding-top'\s*:/g) ?? [];
        expect(matches.length).toBe(1);
        // 그리고 그 값은 space-300 에서 파생된 class 여야 함.
        expect(out.code).toMatch(/'base\|padding-top'\s*:\s*'[^']*space-300/);
    });

    it('template literal join (backtick + interpolation) — build error', () => {
        // 로컬 선언된 vapor class 를 템플릿 literal 로 합치면 catch.
        // (import 로만 받은 참조는 Phase 11 범위 밖 — compile 추적 어려움.)
        const source = src(
            `const base = css({ padding: '$space-100' });` +
                `const override = css({ paddingTop: '$space-300' });` +
                `const cls = \`\${base} \${override}\`;`,
        );
        const out = transform({ source, filename: '/A7.tsx' });
        expect(out.errors.length).toBeGreaterThan(0);
        expect(out.errors[0].code).toMatch(/template-literal|invalid-combine/);
    });

    it('className=template-literal (2 vapor classes) — build error', () => {
        // 2 개 이상의 class identifier 를 className 자리 template literal 로
        // 합치면 catch. 1개 + static 문자열은 허용 (vapor + DOM class 흔한 패턴).
        const source = [
            `import { css } from '@vapor-ui/style-macro';`,
            `import { base } from './base';`,
            `import { override } from './over';`,
            `const Cmp = () => <div className={\`\${base} \${override}\`} />;`,
        ].join('\n');
        const out = transform({ source, filename: '/A8.tsx' });
        expect(out.errors.length).toBeGreaterThan(0);
    });

    it('className template with 1 vapor identifier + plain string — allowed', () => {
        // vapor class 1개 + DOM class 문자열 합성은 유효 패턴.
        const source = [
            `import { css } from '@vapor-ui/style-macro';`,
            `const cls = css({ color: '$fg-primary' });`,
            `const Cmp = ({ on }) => <div className={on ? \`\${cls} active\` : cls} />;`,
        ].join('\n');
        const out = transform({ source, filename: '/A9.tsx' });
        expect(out.errors).toEqual([]);
    });
});
