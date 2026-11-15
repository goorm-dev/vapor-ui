import { existsSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';

import { type ColorSchemeScriptOpts, buildColorSchemeScript } from '~/helpers/fouc-script';

import { compileModule, isModuleCss, sourceOfModuleCss } from './_module-css';
import { type ResolvedOptions, type VaporPluginOptions, resolveOptions, toPosix } from './_options';

export type { VaporPluginOptions };

interface VitePluginShape {
    name: string;
    enforce?: 'pre' | 'post';
    [k: string]: unknown;
}

function foucPlugin(injectColorScheme: ColorSchemeScriptOpts): VitePluginShape {
    const scriptTag = `<script>${buildColorSchemeScript(injectColorScheme)}</script>`;
    return {
        name: 'vapor-style-macro:fouc',
        enforce: 'pre',
        transformIndexHtml(html: string): string {
            if (/(<head[^>]*>)/i.test(html)) {
                return html.replace(/(<head[^>]*>)/i, `$1${scriptTag}`);
            }
            return `${scriptTag}${html}`;
        },
    };
}

interface ModuleNodeLike {
    file: string | null;
}

interface ViteServerLike {
    moduleGraph: {
        getModuleById(id: string): ModuleNodeLike | undefined;
        invalidateModule(mod: ModuleNodeLike): void;
    };
    reloadModule(mod: ModuleNodeLike): Promise<void>;
    config: { logger: { error(msg: string): void } };
}

interface PluginContextLike {
    error(message: string): never;
    addWatchFile(file: string): void;
}

/**
 * 모듈 CSS import 를 절대 경로로. dev 에서 브라우저가 요청하는 URL(`/x.tsx.vapor.css`,
 * root 밖 소스면 `/@fs/abs/x.tsx.vapor.css`)과 importer 기준 상대 경로를 모두 받는다.
 * 절대 경로는 캐시에 있거나 원본 소스가 실제로 있을 때만 그대로 쓴다 — 아니면 root 기준 URL.
 */
function resolveModuleCss(
    path: string,
    importer: string | undefined,
    root: string,
    known: Map<string, string>,
): string {
    if (path.startsWith('/@fs/')) return path.slice('/@fs'.length);
    if (isAbsolute(path) && (known.has(toPosix(path)) || existsSync(sourceOfModuleCss(path)))) {
        return path;
    }
    if (path.startsWith('/')) return join(root, path);
    if (importer) return resolve(dirname(splitQuery(importer)[0]), path);
    return join(root, path);
}

/** 원본 소스만 바뀌었으므로 Vite 는 가상 CSS 모듈을 무효화하지 않는다 — 직접 무효화 후 HMR. */
function reload(server: ViteServerLike, cssId: string): void {
    const mod = server.moduleGraph.getModuleById(cssId);
    if (!mod) return;
    server.moduleGraph.invalidateModule(mod);
    server.reloadModule(mod).catch((e: unknown) => {
        server.config.logger.error(
            `[@vapor-ui/style-macro] Failed to hot-reload ${cssId}: ${(e as Error)?.message ?? e}`,
        );
    });
}

/** `a?b` → `['a', '?b']`. */
function splitQuery(id: string): [string, string] {
    const i = id.indexOf('?');
    return i < 0 ? [id, ''] : [id.slice(0, i), id.slice(i)];
}

/**
 * `css()` 를 class 로 바꾸고 모듈마다 가상 CSS 모듈(`<file>.vapor.css`)을 만든다
 * (`@vanilla-extract/vite-plugin` 과 같은 모델). 변환된 모듈은 자기 CSS 를 마지막 import 뒤에서
 * import 하므로, import 되지 않는 모듈의 CSS 는 번들에 들어가지 않는다.
 *
 * - `resolveId`: `.vapor.css` import 를 절대 경로 id 로. `.css` 로 끝나므로 Vite CSS 파이프라인
 *   (dev `<style>` 주입·HMR, build 추출·청크 분할)을 그대로 탄다.
 * - `load`: `transform` 이 캐시한 CSS. 캐시가 없으면(서버 재시작 직후 CSS 가 먼저 요청되는 경우)
 *   원본 소스를 읽어 컴파일한다.
 * - dev 에서 소스 수정으로 CSS 가 바뀌면 그 CSS 모듈만 `reloadModule` 한다.
 */
function moduleCssPlugin(rawOpts: VaporPluginOptions): VitePluginShape {
    let opts: ResolvedOptions = resolveOptions(rawOpts);
    let server: ViteServerLike | undefined;
    /** 모듈 CSS 절대 posix 경로(= Vite 모듈 id) → CSS. 규칙이 없으면 `''`. */
    const cssByPath = new Map<string, string>();

    function compile(ctx: PluginContextLike, code: string, id: string) {
        try {
            return compileModule(code, id, opts);
        } catch (e) {
            return ctx.error((e as Error).message);
        }
    }

    return {
        name: 'vapor-style-macro',
        enforce: 'pre',

        configResolved(config: { root: string }) {
            opts = resolveOptions(rawOpts, { root: config.root });
        },

        configureServer(s: ViteServerLike) {
            server = s;
        },

        buildStart() {
            cssByPath.clear();
        },

        transform(this: PluginContextLike, code: string, id: string) {
            if (isModuleCss(id)) return null;
            const compiled = compile(this, code, id);
            if (!compiled) return null;

            const cssId = toPosix(compiled.cssPath);
            const css = compiled.css ?? '';
            const prev = cssByPath.get(cssId);
            cssByPath.set(cssId, css);

            if (server && prev !== undefined && prev !== css) reload(server, cssId);
            return compiled.code === code ? null : { code: compiled.code, map: null };
        },

        resolveId(source: string, importer: string | undefined) {
            if (!isModuleCss(source)) return null;
            const [path, query] = splitQuery(source);
            return toPosix(resolveModuleCss(path, importer, opts.root, cssByPath)) + query;
        },

        load(this: PluginContextLike, id: string) {
            if (!isModuleCss(id)) return null;
            const path = toPosix(id.split('?')[0]!);
            const cached = cssByPath.get(path);
            if (cached !== undefined) return cached;

            const sourcePath = sourceOfModuleCss(path);
            let source: string;
            try {
                source = readFileSync(sourcePath, 'utf8');
            } catch {
                return null;
            }
            this.addWatchFile(sourcePath);
            const css = compile(this, source, sourcePath)?.css ?? '';
            cssByPath.set(path, css);
            return css;
        },
    };
}

/**
 * Vite plugin for @vapor-ui/style-macro (Vite 7 · Vite 8).
 *
 *     // vite.config.ts
 *     import { vaporVitePlugin } from '@vapor-ui/style-macro/vite';
 *     export default { plugins: [vaporVitePlugin()] };
 *
 * 각 모듈이 자기 CSS 를 import 하므로 레이어 순서 선언(`@vapor-ui/core/layers.css`)을 앱 CSS
 * 진입점에서 모든 `@vapor-ui/*` import 보다 먼저 import 해야 한다.
 */
export function vaporVitePlugin(opts: VaporPluginOptions = {}): VitePluginShape[] {
    const resolved = resolveOptions(opts);
    const plugins = [moduleCssPlugin(opts)];
    if (resolved.injectColorScheme !== false) plugins.push(foucPlugin(resolved.injectColorScheme));
    return plugins;
}
