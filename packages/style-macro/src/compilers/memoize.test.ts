import { runInNewContext } from 'node:vm';
import { transformWithEsbuild } from 'vite';
import { describe, expect, it } from 'vitest';

import * as runtime from '~/runtime';

import { transform } from './transform';

type Props = Record<string, unknown>;

/**
 * 변환 결과를 실제로 실행한다. JSX 는 `h(type, props)` 로 바꿔 element 의 최종 props 를 모으고,
 * 소스가 부르는 함수 호출 횟수를 센다.
 */
async function run(body: string, scope: Record<string, unknown> = {}) {
    const source = `import { css } from '@vapor-ui/style-macro';\n${body}`;
    const out = transform({ source, filename: '/M.tsx' });
    expect(out.errors).toEqual([]);
    const js = await transformWithEsbuild(out.code, '/M.tsx', {
        loader: 'tsx',
        jsx: 'transform',
        jsxFactory: 'h',
        format: 'cjs',
    });
    const rendered: Props[] = [];
    const h = (_type: unknown, props: Props | null) => {
        rendered.push(props ?? {});
        return props;
    };
    const require = (id: string) => {
        if (id === '@vapor-ui/style-macro/__runtime__') return runtime;
        if (id === '@vapor-ui/style-macro') return { css: () => 'RUNTIME_CSS' };
        throw new Error(`unexpected import ${id}`);
    };
    const module = { exports: {} as Record<string, unknown> };
    runInNewContext(`"use strict";\n${js.code}`, {
        require,
        module,
        exports: module.exports,
        h,
        ...scope,
    });
    return { exports: module.exports, rendered, code: out.code };
}

/** 호출 횟수를 세는 함수. 값은 차례로 `values` 를 돌려준다. */
function counter<T>(...values: T[]) {
    const fn = () => values[Math.min(fn.calls++, values.length - 1)];
    fn.calls = 0;
    return fn;
}

const color = (p: Props) => {
    const style = p.style as Record<string, string> | undefined;
    return style && Object.entries(style).find(([k]) => k.startsWith('--'))?.[1];
};

describe('a condition shared by className and style is evaluated once', () => {
    it('guard around css(): className={next() && css(...)}', async () => {
        const next = counter(true, false);
        const { exports, rendered } = await run(
            `export const C = ({ c }) => <div className={next() && css({ color: c })} />;`,
            { next },
        );
        (exports.C as (p: Props) => void)({ c: 'red' });
        expect(next.calls).toBe(1);
        expect(rendered[0]!.className).toMatch(/\S/);
        expect(color(rendered[0]!)).toBe('red');
    });

    it('condition inside the call: css(next() && { color: c })', async () => {
        const next = counter(true, false);
        const { exports, rendered } = await run(
            `export const C = ({ c }) => <div className={css(next() && { color: c })} />;`,
            { next },
        );
        (exports.C as (p: Props) => void)({ c: 'red' });
        expect(next.calls).toBe(1);
        expect(rendered[0]!.className).toMatch(/\S/);
        expect(color(rendered[0]!)).toBe('red');
    });

    it('className and style agree even when the condition flips between reads', async () => {
        const next = counter(false, true);
        const { exports, rendered } = await run(
            `export const C = ({ c }) => <div className={css({ width: '1px' }, next() && { color: c })} />;`,
            { next },
        );
        (exports.C as (p: Props) => void)({ c: 'red' });
        expect(next.calls).toBe(1);
        expect(color(rendered[0]!)).toBeUndefined();
    });

    it('entry-level ternary test', async () => {
        const pick = counter(true);
        const { exports } = await run(
            `export const C = ({ c }) => <div className={css({ color: c, width: pick() ? '1px' : '2px' })} />;`,
            { pick },
        );
        (exports.C as (p: Props) => void)({ c: 'red' });
        expect(pick.calls).toBe(1);
    });

    it('style evaluated before className (spread first)', async () => {
        const next = counter(true, false);
        const { exports, rendered } = await run(
            `export const C = ({ c, ...rest }) => <div {...rest} className={next() && css({ color: c })} />;`,
            { next },
        );
        (exports.C as (p: Props) => void)({ c: 'red', title: 't' });
        expect(next.calls).toBe(1);
        expect(rendered[0]!.className).toMatch(/\S/);
        expect(rendered[0]!.title).toBe('t');
        expect(color(rendered[0]!)).toBe('red');
    });

    it('style evaluated before className, condition inside the call', async () => {
        const next = counter(true, false);
        const { exports, rendered } = await run(
            `export const C = ({ c }) => <div style={{ width: 1 }} className={css({ width: '1px' }, next() && { color: c })} />;`,
            { next },
        );
        (exports.C as (p: Props) => void)({ c: 'red' });
        expect(next.calls).toBe(1);
        expect(color(rendered[0]!)).toBe('red');
    });

    it('each render gets its own value (function-scoped temp)', async () => {
        const next = counter(true, false, true);
        const { exports, rendered } = await run(
            `export function C({ c }) { return <div className={next() && css({ color: c })} />; }`,
            { next },
        );
        const C = exports.C as (p: Props) => void;
        C({ c: 'a' });
        C({ c: 'b' });
        expect(next.calls).toBe(2);
        expect(color(rendered[0]!)).toBe('a');
        expect(color(rendered[1]!)).toBeUndefined();
        expect(rendered[1]!.className).toBe(false);
    });

    it('keeps a function body directive first', async () => {
        const next = counter(true);
        const { code } = await run(
            `export function C(props) { 'use strict'; const { c } = props; return <div className={next() && css({ color: c })} />; }`,
            { next },
        );
        expect(code).toMatch(/\{ 'use strict';\s*let __vaporT_0;/);
    });

    it.each([
        [
            'function',
            `export function C({ c }, el = <i className={next() && css({ color: c })} />) { return el; }`,
        ],
        [
            'arrow',
            `export const C = ({ c }, el = <i className={next() && css({ color: c })} />) => el;`,
        ],
        [
            'destructured default',
            `export function C({ c, el = <i className={next() && css({ color: c })} /> }) { return el; }`,
        ],
    ])(
        'element in a parameter default (%s) declares its temp in that expression',
        async (_, body) => {
            const next = counter(true, false, true, false);
            const { exports, rendered } = await run(body, { next });
            const C = exports.C as (p: Props) => Props;
            C({ c: 'a' });
            C({ c: 'b' });
            expect(next.calls).toBe(2);
            expect(color(rendered[0]!)).toBe('a');
            expect(rendered[1]!.className).toBe(false);
            expect(color(rendered[1]!)).toBeUndefined();
        },
    );

    it('a parameter default does not run when the argument is passed', async () => {
        const next = counter(true);
        const { exports } = await run(
            `export function C({ c }, el = <i className={next() && css({ color: c })} />) { return el; }`,
            { next },
        );
        (exports.C as (p: Props, el: unknown) => unknown)({ c: 'a' }, 'given');
        expect(next.calls).toBe(0);
    });

    describe('a condition is evaluated exactly once, as in the source, even when its branches look alike', () => {
        it('same class, different slot text (captured constant vs local)', async () => {
            const f = counter(true);
            const { exports, rendered } = await run(
                `const w = '1px';\nconst a = { width: w };\nexport function F({ w }) { return <div className={css(a, f() && { width: w })} />; }`,
                { f },
            );
            (exports.F as (p: Props) => void)({ w: '20px' });
            expect(f.calls).toBe(1);
            expect(color(rendered[0]!)).toBe('20px');
        });

        it('same class, style evaluated first', async () => {
            const f = counter(true);
            const { exports, rendered } = await run(
                `const w = '1px';\nconst a = { width: w };\nexport function F({ w, ...r }) { return <div {...r} className={css(a, f() && { width: w })} />; }`,
                { f },
            );
            (exports.F as (p: Props) => void)({ w: '20px' });
            expect(f.calls).toBe(1);
            expect(color(rendered[0]!)).toBe('20px');
        });

        it('no slot at all: the call still happens', async () => {
            const f = counter(true);
            const { exports } = await run(
                `export const C = () => <div className={css(f() && {})} />;`,
                { f },
            );
            (exports.C as () => void)();
            expect(f.calls).toBe(1);
        });

        it('a re-readable condition with equal branches is still folded away', async () => {
            const { code } = await run(
                `export const C = ({ on }) => <div className={css(on && {})} />;`,
            );
            expect(code).not.toMatch(/on \?/);
        });
    });

    it('module-level element', async () => {
        const next = counter(true);
        const { rendered } = await run(
            `const c = 'red';\nexport const el = <div className={next() && css({ color: c })} />;`,
            { next },
        );
        expect(next.calls).toBe(1);
        expect(color(rendered[0]!)).toBe('red');
    });

    it('does not memoize a re-readable test (identifier, `!x`, literal)', async () => {
        const { code } = await run(
            `export const C = ({ on, c }) => <div className={on && css(!on && { width: '1px' }, { color: c })} />;`,
        );
        expect(code).not.toContain('__vaporT_');
    });

    it('does not memoize when there is no style slot', async () => {
        const { code } = await run(
            `export const C = () => <div className={next() && css({ color: 'red' })} />;`,
            { next: () => true },
        );
        expect(code).not.toContain('__vaporT_');
    });
});
