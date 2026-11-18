import { relative } from 'node:path';
import { createUnplugin } from 'unplugin';

import {
    MODULE_CSS_PLACEHOLDER,
    MODULE_CSS_SUFFIX,
    VAPOR_SRC_QUERY,
    compileModule,
} from './_module-css';
import { type ResolvedOptions, type VaporPluginOptions, resolveOptions, toPosix } from './_options';

export type { VaporPluginOptions };

/**
 * webpack 용 JS 변환. `css()` 를 class 로 바꾸고, CSS 를 만든 모듈에
 * `import '@vapor-ui/style-macro/module.vapor.css?vapor-src=src%2Fa.tsx.vapor.css'` 를 넣는다. 쿼리 값도
 * `.css` 로 끝나야 Next dev 가 이 모듈을 CSS import 로 보고 수정 시 스타일을 갱신한다
 * (`mod.resource` 에 `/\.css$/` 검사).
 *
 * 리소스가 실제 `.css` 파일이라 앱의 CSS 규칙(css-loader·mini-css-extract, Next 내장 CSS)을
 * 그대로 타고, Next 의 RSC CSS 수집도 서버 컴포넌트의 CSS 로 인식한다. 소스마다 쿼리가 달라
 * 모듈이 따로 생기고, `vaporWebpackPlugin` 의 `enforce: 'pre'` 규칙(`css-loader`)이 쿼리가
 * 가리키는 소스를 CSS 로 컴파일한다. 소스 경로는 root 기준 상대 경로라 빌드 머신과 무관하다.
 *
 * `root` 는 webpack `compiler.context` 로 늦게 확정되므로 옵션 해석을 첫 사용 시점까지 미룬다.
 */
export default createUnplugin<VaporPluginOptions | undefined>((rawOpts) => {
    const raw = rawOpts ?? {};
    let resolved: ResolvedOptions | null = null;
    const opts = (): ResolvedOptions => (resolved ??= resolveOptions(raw));

    return {
        name: 'vapor-style-macro',
        enforce: 'pre',

        webpack(compiler: { context?: string }) {
            if (!resolved && compiler.context) {
                resolved = resolveOptions(raw, { root: compiler.context });
            }
        },

        transformInclude(id) {
            return opts().include(id.split('?')[0]!);
        },

        transform(code, id) {
            let compiled;
            try {
                compiled = compileModule(
                    code,
                    id,
                    opts(),
                    (_cssName, filename) =>
                        `${MODULE_CSS_PLACEHOLDER}?${VAPOR_SRC_QUERY}=${encodeURIComponent(
                            toPosix(relative(opts().root, filename)),
                        )}${MODULE_CSS_SUFFIX}`,
                );
            } catch (e) {
                this.error((e as Error).message);
                return null;
            }
            if (!compiled || compiled.code === code) return null;
            return { code: compiled.code, map: compiled.map };
        },
    };
});
