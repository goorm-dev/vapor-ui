import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { type ColorSchemeScriptOpts, buildColorSchemeScript } from '~/helpers/fouc-script';

import { MODULE_CSS_PLACEHOLDER, VAPOR_SRC_QUERY } from './_module-css';
import type { VaporPluginOptions } from './_options';

export interface MinimalCompiler {
    context?: string;
    options: {
        module: { rules: unknown[] };
        resolve: { alias?: unknown };
        plugins?: unknown[];
    };
    hooks: {
        compilation: { tap: (name: string, fn: (c: unknown) => void) => void };
    };
}

interface HtmlTag {
    tagName: string;
    voidTag: boolean;
    attributes: Record<string, string | boolean>;
    innerHTML?: string;
}

interface HtmlTagGroups {
    headTags: HtmlTag[];
}

/** html-webpack-plugin 의 class (static `getHooks`). */
interface HtmlWebpackPluginClass {
    getHooks(compilation: unknown): {
        alterAssetTagGroups: {
            tap(name: string, fn: (data: HtmlTagGroups) => HtmlTagGroups | void): void;
        };
    };
}

const TAP_NAME = 'vapor-style-macro';

/**
 * FOUC guard 를 플러그인이 넣는 head 태그 중 맨 앞(번들 script 앞)에 넣는다. 템플릿에 직접 쓴
 * head 내용 뒤, `</head>` 앞이다 — body 보다 먼저 실행되므로 첫 paint 전이다. HTML 은 html-webpack-plugin 의 태그 API
 * (`alterAssetTagGroups` 의 `headTags`)에 맡긴다 — 위치를 정규식으로 찾지 않는다.
 *
 * 그 플러그인 class 는 앱 설정에 들어 있는 인스턴스의 constructor 를 쓴다. `getHooks` 는 class
 * 마다 따로라, 이 패키지 위치에서 `require` 한 다른 복사본의 훅은 앱 빌드에서 불리지 않는다.
 * 앱에 html-webpack-plugin 이 없으면 주입할 HTML 도 없다.
 */
export function tapHtmlFouc(
    compiler: MinimalCompiler,
    injectColorScheme: false | ColorSchemeScriptOpts,
): void {
    if (injectColorScheme === false) return;
    const HtmlWebpackPlugin = (compiler.options.plugins ?? [])
        .map((p) => (p as { constructor?: unknown } | null)?.constructor)
        .find(
            (c): c is HtmlWebpackPluginClass =>
                typeof (c as Partial<HtmlWebpackPluginClass> | undefined)?.getHooks ===
                    'function' && (c as { name?: string }).name === 'HtmlWebpackPlugin',
        );
    if (!HtmlWebpackPlugin) return;

    const tag: HtmlTag = {
        tagName: 'script',
        voidTag: false,
        attributes: {},
        innerHTML: buildColorSchemeScript(injectColorScheme),
    };
    compiler.hooks.compilation.tap(TAP_NAME, (compilation) => {
        HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tap(TAP_NAME, (data) => {
            data.headTags.unshift(tag);
            return data;
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
    const self = selfPath();
    return join(dirname(self), `${name}${extname(self)}`);
}

function selfPath(): string {
    return typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
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
 * alias 가 필요한 이유: enhanced-resolve 는 `exports` 를 해석할 때 쿼리까지 subpath 로 봐서
 * `./module.vapor.css` 항목에 맞지 않는다. alias 는 exports 보다 먼저 적용되고 쿼리를 보존한다. `$` (객체) / `onlyModule` (배열)로 정확히 이 요청만 바꾼다.
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

/**
 * 자리표시 파일(`module.vapor.css`, 패키지 루트) 경로. 이 모듈 기준 상대 경로로 찾는다 — 소스
 * (`src/plugins/`)와 배포물(`dist/plugins/`) 모두 패키지 루트에서 두 단계 아래다. 패키지 이름으로
 * 찾지 않으므로 빌드(dist) 없이도 동작한다.
 */
function resolvePlaceholder(): string {
    return join(dirname(selfPath()), '..', '..', 'module.vapor.css');
}
