/**
 * 테스트 전용: 변환 결과를 실제로 실행한다 (strict mode, node:vm). 빌드 대상이 아니다 (`_` 접두).
 */
import { runInNewContext } from 'node:vm';
import { transformWithEsbuild } from 'vite';
import { expect } from 'vitest';

import * as runtime from '~/runtime';

import { transform } from './transform';

export type Props = Record<string, unknown>;

/**
 * 변환 결과를 실제로 실행한다. JSX 는 `h(type, props)` 로 바꿔 element 의 최종 props 를 모으고,
 * 소스가 부르는 함수 호출 횟수를 센다.
 */
export async function run(body: string, scope: Record<string, unknown> = {}) {
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
export function counter<T>(...values: T[]) {
    const fn = () => values[Math.min(fn.calls++, values.length - 1)];
    fn.calls = 0;
    return fn;
}

/** element 의 첫 style slot 값. */
export const color = (p: Props) => {
    const style = p.style as Record<string, string> | undefined;
    return style && Object.entries(style).find(([k]) => k.startsWith('--'))?.[1];
};

/** `data-k` 로 렌더된 element props 찾기. */
export const byKey = (rendered: Props[], k: string) => rendered.find((p) => p['data-k'] === k);
