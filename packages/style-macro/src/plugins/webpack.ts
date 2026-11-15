import { createRequire } from 'node:module';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { type ColorSchemeScriptOpts, buildColorSchemeScript } from '~/helpers/fouc-script';

import unplugin from './_factory';
import { MODULE_CSS_PLACEHOLDER, VAPOR_SRC_QUERY } from './_module-css';
import { type VaporPluginOptions, resolveOptions } from './_options';

export type { VaporPluginOptions };

interface WebpackPluginShape {
    apply(compiler: unknown): void;
}

interface MinimalCompiler {
    context?: string;
    options: { module: { rules: unknown[] }; resolve: { alias?: unknown } };
    hooks: {
        compilation: { tap: (name: string, fn: (c: unknown) => void) => void };
    };
}

interface HtmlPluginData {
    html: string;
}

type HtmlWebpackPluginShape = {
    getHooks?: (c: unknown) => {
        beforeEmit: {
            tapAsync: (
                n: string,
                fn: (d: HtmlPluginData, cb: (err: Error | null, d: HtmlPluginData) => void) => void,
            ) => void;
        };
    };
};

const TAP_NAME = 'vapor-style-macro';

function tapHtmlFouc(compiler: unknown, injectColorScheme: false | ColorSchemeScriptOpts): void {
    if (injectColorScheme === false) return;

    const scriptTag = `<script>${buildColorSchemeScript(injectColorScheme)}</script>`;
    const injectIntoHead = (html: string): string =>
        /(<head[^>]*>)/i.test(html)
            ? html.replace(/(<head[^>]*>)/i, `$1${scriptTag}`)
            : `${scriptTag}${html}`;

    const require = createRequire(import.meta.url);

    let HtmlWebpackPlugin: HtmlWebpackPluginShape | undefined;

    try {
        HtmlWebpackPlugin = require('html-webpack-plugin') as HtmlWebpackPluginShape;
    } catch {
        /* not installed */
    }

    if (!HtmlWebpackPlugin?.getHooks) return;

    const plugin = HtmlWebpackPlugin;
    (compiler as MinimalCompiler).hooks.compilation.tap(TAP_NAME, (compilation) => {
        plugin.getHooks!(compilation).beforeEmit.tapAsync(TAP_NAME, (data, cb) => {
            data.html = injectIntoHead(data.html);
            cb(null, data);
        });
    });
}

const MODULE_CSS_RE = /module\.vapor\.css$/;
const MODULE_CSS_QUERY_RE = new RegExp(`${VAPOR_SRC_QUERY}=`);

/**
 * loader 에 넘길 옵션. 직렬화 가능한 값만 (Turbopack loader 와 같은 형태). `root` 는 사용자가
 * 지정했을 때만 넘긴다 — 아니면 loader 가 번들러의 `rootContext` 를 쓴다 (Vanilla Extract 와 같음).
 */
export function loaderOptions(opts: VaporPluginOptions): VaporPluginOptions {
    const { include, exclude, root, hash, layer } = opts;
    return Object.fromEntries(
        Object.entries({ include, exclude, root, hash, layer }).filter(([, v]) => v !== undefined),
    );
}

/**
 * 이 모듈과 같은 폴더의 `name` 모듈 경로. 확장자는 실행 중인 파일을 따른다 — 배포물에서는
 * `css-loader.mjs` / `.cjs`, 소스(테스트)에서는 `css-loader.ts`. 패키지 이름으로 찾지 않으므로
 * 빌드(dist) 없이도 동작하고, 설치 위치와 무관하다.
 */
export function siblingModule(name: string): string {
    const self = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
    return join(dirname(self), `${name}${extname(self)}`);
}

export function resolveCssLoader(): string {
    return siblingModule('css-loader');
}

/**
 * 모듈 CSS 요청(`@vapor-ui/style-macro/module.vapor.css?vapor-src=…`)에 `css-loader` 를 붙이는 규칙. 앱의
 * `.css` 규칙도 함께 걸리고, `enforce: 'pre'` 라 이 loader 가 먼저 돌아 쿼리가 가리키는 소스의
 * CSS 를 넘긴다. 패키지가 `sideEffects` 로 자리표시 파일을 지정하지만 규칙에도 명시한다.
 */
export function moduleCssRule(opts: VaporPluginOptions) {
    return {
        test: MODULE_CSS_RE,
        resourceQuery: MODULE_CSS_QUERY_RE,
        enforce: 'pre' as const,
        sideEffects: true,
        use: [{ loader: resolveCssLoader(), options: loaderOptions(opts) }],
    };
}

/**
 * 모듈 CSS 규칙과 자리표시 specifier alias 를 컴파일러 설정에 넣는다.
 *
 * alias 가 필요한 이유: enhanced-resolve 는 `exports` 를 해석할 때 쿼리까지 subpath 로 보고
 * `./*` 패턴에 맞춰 버린다 (`./dist/plugins/module.vapor.css?…mjs`). alias 는 exports 보다 먼저
 * 적용되고 쿼리를 보존한다. `$` (객체) / `onlyModule` (배열)로 정확히 이 요청만 바꾼다.
 */
export function applyModuleCss(compiler: MinimalCompiler, opts: VaporPluginOptions): void {
    compiler.options.module.rules.push(moduleCssRule(opts));

    const file = resolvePlaceholder();
    const resolveOpts = compiler.options.resolve;
    if (Array.isArray(resolveOpts.alias)) {
        resolveOpts.alias.push({ name: MODULE_CSS_PLACEHOLDER, alias: file, onlyModule: true });
    } else {
        resolveOpts.alias = {
            ...(resolveOpts.alias as Record<string, unknown> | undefined),
            [`${MODULE_CSS_PLACEHOLDER}$`]: file,
        };
    }
}

function resolvePlaceholder(): string {
    const modulePath = typeof __filename !== 'undefined' ? __filename : import.meta.url;
    return createRequire(modulePath).resolve(MODULE_CSS_PLACEHOLDER);
}

/**
 * Webpack plugin for @vapor-ui/style-macro (webpack 5).
 *
 * `css()` 를 쓰는 모듈마다 자기 CSS 를 import 한다 (`module.vapor.css?vapor-src=…`). 이 요청은
 * 앱의 `.css` 규칙(css-loader + style-loader / mini-css-extract-plugin)으로 처리되므로 앱에
 * `.css` 규칙이 있어야 한다. 레이어 순서는 앱 CSS 진입점에서 `@vapor-ui/core/layers.css` 를
 * 모든 `@vapor-ui/*` import 보다 먼저 import 해 고정한다.
 *
 *     // webpack.config.js
 *     import { vaporWebpackPlugin } from '@vapor-ui/style-macro/webpack';
 *     module.exports = { plugins: [vaporWebpackPlugin()] };
 */
export function vaporWebpackPlugin(opts: VaporPluginOptions = {}): WebpackPluginShape {
    const resolved = resolveOptions(opts);
    const base = unplugin.webpack(opts) as WebpackPluginShape;

    return {
        apply(compiler) {
            applyModuleCss(compiler as MinimalCompiler, opts);
            base.apply(compiler);
            tapHtmlFouc(compiler, resolved.injectColorScheme);
        },
    };
}
