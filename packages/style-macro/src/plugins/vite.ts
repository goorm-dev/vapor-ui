import { type ColorSchemeScriptOpts, buildColorSchemeScript } from '~/helpers/fouc-script';

import { type CollectOptions, replaceAtRule, warnIfNeverReplaced } from './_collect';
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
 * `@vapor-utilities;` 를 프로젝트 전체 `css()` 룰로 치환.
 * 소스 파일이 바뀌면 그 CSS 모듈을 무효화해 재생성한다.
 */
function collectPlugin(opts: CollectOptions): VitePluginShape {
    const cssFiles = new Set<string>();
    let server: ViteServerLike | null = null;

    return {
        name: 'vapor-style-macro:collect',
        enforce: 'pre',
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
            if (!id.split('?')[0].endsWith('.css')) return null;
            const result = replaceAtRule(code, opts);
            if (!result) return null;
            cssFiles.add(id.split('?')[0]);
            for (const f of result.files) this.addWatchFile(f);
            return { code: result.css, map: null };
        },
        buildEnd(this: ViteCollectContext) {
            warnIfNeverReplaced(opts, (m) => this.warn(m));
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
 * CSS 진입점에 `@vapor-utilities;` 를 한 번 적어야 스타일이 방출된다.
 */
export function vaporVitePlugin(opts: VaporPluginOptions = {}): VitePluginShape[] {
    const resolved = resolveOptions(opts);

    const base = unplugin.vite(opts);
    const plugins = (Array.isArray(base) ? base : [base]) as VitePluginShape[];

    plugins.push(collectPlugin(opts));
    if (resolved.injectColorScheme !== false) plugins.push(foucPlugin(resolved.injectColorScheme));

    return plugins;
}
