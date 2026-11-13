import { type ColorSchemeScriptOpts, buildColorSchemeScript } from '~/helpers/fouc-script';

import { type CollectOptions, injectCss, warnIfNeverReplaced } from './_collect';
import unplugin from './_factory';
import { type VaporPluginOptions, resolveOptions } from './_options';

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

interface ViteCollectContext {
    addWatchFile(file: string): void;
    warn(msg: string): void;
}

interface ViteServerLike {
    watcher: { on(event: string, cb: (file: string) => void): void };
    moduleGraph: {
        getModulesByFile(file: string): Set<unknown> | undefined;
        invalidateModule(mod: unknown): void;
    };
    ws: { send(payload: { type: string; path?: string }): void };
}

/**
 * 수집 결과를 CSS 에 삽입. 삽입 지점은 `@vapor-utilities;` 또는
 * `@import '@vapor-ui/core/layers.css'` 가 있는 파일 (Vite 는 `@import` 된 파일을
 * 플러그인에 넘기지 않으므로 import 지점에서 처리한다). 같은 이유로 마커는
 * `@import` 된 partial 이 아니라 Vite 가 직접 받는 CSS 파일에 있어야 한다.
 * pre 단계에서 치환하므로 마커가 vite:css·minifier 까지 남지 않는다.
 * 소스 파일이 바뀌면 그 CSS 모듈을 무효화해 재생성한다.
 */
function collectPlugin(opts: CollectOptions): VitePluginShape {
    const cssFiles = new Set<string>();
    let server: ViteServerLike | null = null;
    let root: string | undefined;

    return {
        name: 'vapor-style-macro:collect',
        enforce: 'pre',
        configResolved(config: { root: string }) {
            root = config.root;
        },
        configureServer(s: ViteServerLike) {
            server = s;
            const invalidate = (file: string) => {
                if (!/\.(?:[cm]?[jt]sx?)$/.test(file)) return;
                for (const cssFile of cssFiles) {
                    const mods = server?.moduleGraph.getModulesByFile(cssFile);
                    if (!mods) continue;
                    for (const m of mods) server?.moduleGraph.invalidateModule(m);
                }
                server?.ws.send({ type: 'full-reload' });
            };
            s.watcher.on('change', invalidate);
            s.watcher.on('add', invalidate);
            s.watcher.on('unlink', invalidate);
        },
        transform(this: ViteCollectContext, code: string, id: string) {
            const file = id.split('?')[0];
            if (!file.endsWith('.css')) return null;
            const result = injectCss(code, opts, { root });
            if (!result) return null;
            cssFiles.add(file);
            for (const f of result.files) this.addWatchFile(f);
            return { code: result.css, map: null };
        },
        buildEnd(this: ViteCollectContext) {
            warnIfNeverReplaced(opts, (m) => this.warn(m), { root });
        },
    };
}

/**
 * Vite plugin for @vapor-ui/style-macro.
 *
 *     // vite.config.ts
 *     import vaporStyle from '@vapor-ui/style-macro/vite';
 *     export default { plugins: [vaporStyle()] };
 *
 * CSS 진입점이 `@vapor-ui/core/layers.css` 를 import 하거나 `@vapor-utilities;` 를
 * 포함해야 스타일이 방출된다.
 */
export function vaporVitePlugin(opts: VaporPluginOptions = {}): VitePluginShape[] {
    const resolved = resolveOptions(opts);

    const base = unplugin.vite(opts);
    const plugins = (Array.isArray(base) ? base : [base]) as VitePluginShape[];

    plugins.push(collectPlugin(opts));
    if (resolved.injectColorScheme !== false) plugins.push(foucPlugin(resolved.injectColorScheme));

    return plugins;
}
