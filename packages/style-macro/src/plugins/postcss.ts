import { dirname } from 'node:path';
import type { AtRule, Root } from 'postcss';

import { type CollectOptions, collectCss, insertSheet } from './_collect';

export type VaporPostcssOptions = CollectOptions;

interface PostcssHelpers {
    /** 호스트 postcss 인스턴스. 삽입 노드는 반드시 이 파서로 만든다. */
    postcss: { parse(css: string): Root };
    result: {
        messages: unknown[];
        opts?: { from?: string };
        warn(text: string, opts?: { node?: unknown; plugin?: string }): unknown;
    };
}

const PLUGIN_NAME = 'vapor-style-macro';

/**
 * Vapor 레이어 순서를 선언하는 `@layer` 문(블록 없는 statement)을 찾는다.
 * core `layers.css` 가 인라인됐거나 사용자가 순서를 직접 적은 CSS 진입점의 표식이다.
 * `vapor-theme` 으로 판별한다 — 라이브러리 시트(`@layer vapor-utilities;`)는 이 이름을 쓰지 않는다.
 */
function findLayerOrderDeclaration(root: Root): AtRule | null {
    let found: AtRule | null = null;
    root.walkAtRules('layer', (at) => {
        if (found || at.nodes) return;
        if (at.params.split(',').some((name) => name.trim() === 'vapor-theme')) found = at;
    });
    return found;
}

function missingInsertionPointMessage(file: string | undefined): string {
    return (
        `[@vapor-ui/style-macro] ${file ?? 'This stylesheet'} declares the Vapor layer order but has no ` +
        'insertion point, so css() styles are not emitted. If postcss-import inlined ' +
        "`@import '@vapor-ui/core/layers.css'` before this plugin ran, list vaporPostcss before " +
        'postcss-import, or add `@vapor-utilities;` to this file.'
    );
}

/**
 * 전용 어댑터가 없는 번들러(rolldown, Parcel, 순수 webpack 등) 용 PostCSS 플러그인.
 * `@vapor-utilities;` 를 수집 결과로 치환하고 소스 파일을 watch 의존성으로 등록한다.
 * 마커가 없으면 `@import '@vapor-ui/core/layers.css'` 뒤에 붙인다 — 이 트리거는
 * postcss-import 보다 앞에 등록해야 보인다. 둘 다 없는데 Vapor 레이어 순서가 선언된
 * 진입점이면 경고한다.
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
        postcssPlugin: PLUGIN_NAME,
        Once(root: Root, { postcss, result }: PostcssHelpers) {
            const from = result.opts?.from;
            const defaults = { root: from ? dirname(from) : undefined };
            const collected = insertSheet(root, (css) => postcss.parse(css), opts, defaults);

            if (!collected) {
                // 삽입 지점이 사라진 진입점: postcss-import 가 먼저 돌아 `@import` 트리거가
                // 인라인됐거나, 레이어 순서를 직접 선언하고 마커를 빠뜨린 경우.
                const declaration = findLayerOrderDeclaration(root);
                if (declaration && collectCss(opts, defaults).files.length > 0) {
                    result.warn(missingInsertionPointMessage(from), {
                        node: declaration,
                        plugin: PLUGIN_NAME,
                    });
                }
                return;
            }

            for (const file of collected.files) {
                result.messages.push({
                    type: 'dependency',
                    plugin: PLUGIN_NAME,
                    file,
                    parent: from,
                });
            }
            result.messages.push({
                type: 'dir-dependency',
                plugin: PLUGIN_NAME,
                dir: collected.root,
                glob: '**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}',
                parent: from,
            });
        },
    };
}

vaporPostcss.postcss = true;

export default vaporPostcss;
