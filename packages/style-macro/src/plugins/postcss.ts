import { type CollectOptions, VAPOR_AT_RULE, collectCss, collectState } from './_collect';

export type VaporPostcssOptions = CollectOptions;

// postcss 타입 의존 없이 duck-typing. 런타임 helpers 에 `postcss` 파서가 실려 온다.
interface PostcssRoot {
    walkAtRules(name: string, cb: (at: PostcssAtRule) => void): void;
}
interface PostcssAtRule {
    replaceWith(...nodes: unknown[]): void;
}
interface PostcssHelpers {
    postcss: { parse(css: string): unknown };
    result: { messages: unknown[]; opts?: { from?: string } };
}

/**
 * 전용 어댑터가 없는 번들러(rolldown, Parcel, 순수 webpack 등) 용 PostCSS 플러그인.
 * `@vapor-utilities;` 를 수집 결과로 치환하고 소스 파일을 watch 의존성으로 등록한다.
 *
 *     // postcss.config.mjs
 *     import { vaporPostcss } from '@vapor-ui/style-macro/postcss';
 *     export default { plugins: [vaporPostcss()] };
 *
 * Next.js 에서는 쓰지 않는다 — `vaporNextPlugin` 이 webpack/Turbopack 에 css-loader 를
 * 직접 배선한다. Turbopack 은 `postcss.config` 를 번들링하면서 oxc 네이티브 바인딩을
 * 처리하지 못한다.
 */
export function vaporPostcss(opts: VaporPostcssOptions = {}) {
    return {
        postcssPlugin: 'vapor-style-macro',
        Once(root: PostcssRoot, { postcss, result }: PostcssHelpers) {
            const targets: PostcssAtRule[] = [];
            root.walkAtRules(VAPOR_AT_RULE, (at) => {
                targets.push(at);
            });
            if (!targets.length) return;

            const collected = collectCss(opts);
            collectState.replaced++;
            const parent = result.opts?.from;
            for (const file of collected.files) {
                result.messages.push({
                    type: 'dependency',
                    plugin: 'vapor-style-macro',
                    file,
                    parent,
                });
            }
            result.messages.push({
                type: 'dir-dependency',
                plugin: 'vapor-style-macro',
                dir: collected.root,
                glob: '**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}',
                parent,
            });

            for (const at of targets) at.replaceWith(postcss.parse(collected.css));
        },
    };
}

vaporPostcss.postcss = true;

export default vaporPostcss;
