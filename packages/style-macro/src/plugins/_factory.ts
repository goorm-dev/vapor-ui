import { createUnplugin } from 'unplugin';

import { formatBuildError } from '~/compilers/code-frame';
import { transform } from '~/compilers/transform';

import { type ResolvedOptions, type VaporPluginOptions, resolveOptions, scopeOf } from './_options';

export type { VaporPluginOptions };

/**
 * JS 변환만 담당하는 공용 unplugin. `css()` 호출을 class string 으로 치환한다.
 * CSS 는 여기서 방출하지 않는다 — 각 번들러의 CSS 파이프라인이 `@vapor-utilities;` 자리 또는
 * `@import '@vapor-ui/core/layers.css'` 가 있는 파일에 수집 결과를 넣는다 (`_collect.ts`).
 *
 * `root` 는 번들러가 알려주는 프로젝트 루트(Vite `config.root`, webpack `compiler.context`)
 * 로 늦게 확정되므로 옵션 해석을 첫 사용 시점까지 미룬다.
 */
export default createUnplugin<VaporPluginOptions | undefined>((rawOpts) => {
    const raw = rawOpts ?? {};
    let resolved: ResolvedOptions | null = null;
    const opts = (): ResolvedOptions => (resolved ??= resolveOptions(raw));
    const setRoot = (root: string | undefined) => {
        if (resolved || !root) return;
        resolved = resolveOptions(raw, { root });
    };

    return {
        name: 'vapor-style-macro',
        enforce: 'pre',

        vite: {
            configResolved(config: { root: string }) {
                setRoot(config.root);
            },
        },
        webpack(compiler: { context?: string }) {
            setRoot(compiler.context);
        },

        transformInclude(id) {
            return opts().include(id.split('?')[0]);
        },

        transform(code, id) {
            const filename = id.split('?')[0];
            const { hash, root } = opts();
            const result = transform({
                source: code,
                filename,
                hash,
                scope: scopeOf(root, filename),
            });

            if (result.errors.length) {
                const msg = result.errors
                    .map((e) => formatBuildError(e, code, filename))
                    .join('\n\n');
                this.error(msg);
                return null;
            }

            return result.code === code ? null : { code: result.code, map: null };
        },
    };
});
