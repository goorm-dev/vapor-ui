import { existsSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';

import { type ColorSchemeScriptOpts, buildColorSchemeScript } from '~/helpers/fouc-script';

import { splitQuery, stripQuery } from './_id';
import { compileOrError, isModuleCss, sourceOfModuleCss } from './_module-css';
import {
    type ResolvedOptions,
    type VaporPluginOptions,
    includedPackages,
    resolveColorScheme,
    resolveOptions,
    toPosix,
} from './_options';
import { FS_PREFIX, fsPathFromFsUrl } from './_vite';

export type { VaporPluginOptions };

interface VitePluginShape {
    name: string;
    enforce?: 'pre' | 'post';
    [k: string]: unknown;
}

/**
 * FOUC guard 를 `<head>` 맨 앞에 넣는다. HTML 은 Vite 의 태그 주입(`injectTo: 'head-prepend'`)에
 * 맡긴다 — Vite 가 HTML 을 파싱해 `<head>` 를 찾고, 없으면 만든다. 다른 head script 보다 먼저
 * 실행돼야 첫 paint 전에 theme attribute 가 붙는다.
 */
function foucPlugin(injectColorScheme: ColorSchemeScriptOpts): VitePluginShape {
    const children = buildColorSchemeScript(injectColorScheme);
    return {
        name: 'vapor-style-macro:fouc',
        enforce: 'pre',
        transformIndexHtml() {
            return [{ tag: 'script', children, injectTo: 'head-prepend' }];
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
    if (path.startsWith(FS_PREFIX)) return fsPathFromFsUrl(path);
    if (isAbsolute(path) && (known.has(toPosix(path)) || existsSync(sourceOfModuleCss(path)))) {
        return path;
    }
    if (path.startsWith('/')) return join(root, path);
    if (importer) return resolve(dirname(stripQuery(importer)), path);
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
    // root 는 Vite 가 `configResolved` 에서 확정한 `config.root` 를 그대로 쓴다. 그 전에는 해석하지
    // 않는다 — 이후 훅(transform·resolveId·load)은 모두 configResolved 뒤에 불린다.
    let resolved: ResolvedOptions | null = null;
    const opts = (): ResolvedOptions => (resolved ??= resolveOptions(rawOpts));
    let server: ViteServerLike | undefined;
    /** 모듈 CSS 절대 posix 경로(= Vite 모듈 id) → CSS. 규칙이 없으면 `''`. */
    const cssByPath = new Map<string, string>();

    return {
        name: 'vapor-style-macro',
        enforce: 'pre',

        // include 로 지목한 패키지는 앱 소스처럼 이 플러그인의 transform 을 거쳐야 한다. Vite 는
        // node_modules 의존성을 두 곳에서 우회한다 — dev 의 dependency pre-bundling(esbuild)과 SSR
        // 의 externalize(Node 가 직접 import). 둘 다에서 빼는 것이 Vite 가 정한 방법이다
        // (`optimizeDeps.exclude`, `ssr.noExternal`; 소스 상태로 배포되는 패키지와 같은 취급).
        // 패키지 이름만 glob 에서 읽으므로 root 가 필요 없다.
        config() {
            const packages = includedPackages(rawOpts.include ?? []);
            if (!packages.length) return null;
            return { optimizeDeps: { exclude: packages }, ssr: { noExternal: packages } };
        },

        configResolved(config: { root: string }) {
            resolved = resolveOptions(rawOpts, { root: config.root });
        },

        configureServer(s: ViteServerLike) {
            server = s;
        },

        buildStart() {
            cssByPath.clear();
        },

        transform(this: PluginContextLike, code: string, id: string) {
            if (isModuleCss(id)) return null;
            const compiled = compileOrError(this, code, id, opts());
            if (!compiled) return null;

            const cssId = toPosix(compiled.cssPath);
            const css = compiled.css ?? '';
            const prev = cssByPath.get(cssId);
            cssByPath.set(cssId, css);

            if (server && prev !== undefined && prev !== css) reload(server, cssId);
            return compiled.code === code ? null : { code: compiled.code, map: compiled.map };
        },

        resolveId(source: string, importer: string | undefined) {
            if (!isModuleCss(source)) return null;
            const [path, query] = splitQuery(source);
            return toPosix(resolveModuleCss(path, importer, opts().root, cssByPath)) + query;
        },

        load(this: PluginContextLike, id: string) {
            if (!isModuleCss(id)) return null;
            const path = toPosix(stripQuery(id));
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
            const css = compileOrError(this, source, sourcePath, opts())?.css ?? '';
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
    const injectColorScheme = resolveColorScheme(opts.injectColorScheme);
    const plugins = [moduleCssPlugin(opts)];
    if (injectColorScheme !== false) plugins.push(foucPlugin(injectColorScheme));
    return plugins;
}
