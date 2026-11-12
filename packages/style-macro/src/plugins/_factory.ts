import { createUnplugin } from 'unplugin';

import { formatBuildError } from '~/compilers/code-frame';
import { transform } from '~/compilers/transform';

import { type VaporPluginOptions, resolveOptions } from './_options';

export type { VaporPluginOptions };

/**
 * JS 변환만 담당하는 공용 unplugin. `css()` 호출을 class string 으로 치환한다.
 * CSS 는 여기서 방출하지 않는다 — 각 번들러의 CSS 파이프라인이 `@vapor-utilities;`
 * 를 수집 결과로 치환한다 (`_collect.ts`).
 */
export default createUnplugin<VaporPluginOptions | undefined>((rawOpts) => {
    const opts = resolveOptions(rawOpts ?? {});

    return {
        name: 'vapor-style-macro',
        enforce: 'pre',

        transformInclude(id) {
            return opts.include(id.split('?')[0]);
        },

        transform(code, id) {
            const filename = id.split('?')[0];
            const result = transform({ source: code, filename, hash: opts.hash });

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
