import type { ManifestShape } from '@vapor-ui/tokens';
import { createHash } from 'node:crypto';
import { createUnplugin } from 'unplugin';

import { emitLayerOrderCss, resolveOptions } from '~/adapters/shared';
import { formatBuildError } from '~/compiler/code-frame';
import { transform } from '~/compiler/transform';

interface FileRecord {
    css: string;
    classes: string[];
}

// Webpack 5 rejects unknown URI schemes (only `data:` and `file:` are native),
// so the PUBLIC prefix must NOT contain a colon. A path-like specifier under a
// tilde-prefixed pseudo-package is safely intercepted by unplugin's resolveId
// hook across vite/rollup/webpack/rspack/esbuild adapters.
//
// Historically the resolveId hook prepended `\0` (Rollup virtual-module
// convention). This produced `_virtual_%00~vapor-style%2F<hash>.css` after
// unplugin's webpack adapter URL-encoded the request. Next.js 16's webpack
// pipeline appears to reject the `%00`-containing request at the resolver
// stage even though VMP is force-applied. Dropping `\0` and returning the
// prefix verbatim so the encoded form is `_virtual_%7Evapor-style%2F...`.
const VIRTUAL_PREFIX = '~vapor-style/';
const VIRTUAL_SUFFIX = '.css';
const PUBLIC_PREFIX = '~vapor-style/';

function hashContent(input: string): string {
    return createHash('sha1').update(input).digest('hex').slice(0, 12);
}

// Records + discovered layer order live at module scope so they're shared
// across every unplugin instance created by the same process. Next.js 16
// invokes the webpack config function once per compiler (client, RSC server,
// edge) — each invocation would otherwise get its own factory closure with
// its own records Map. The transform hook fires only in the compiler that
// bundles a given source file, but the corresponding virtual CSS may be
// loaded by a DIFFERENT compiler (e.g. RSC transforms page.tsx, client
// extracts the CSS). Without shared state, load() finds no record and
// returns null, so the extracted CSS is empty. Content-hashed keys
// (sha1(css).slice(0,12)) guarantee sharing is collision-safe.
const records = new Map<string, FileRecord>();

export default createUnplugin<VaporStyleOptions | undefined>((rawOpts) => {
    const opts = resolveOptions(rawOpts ?? {});
    const layerOrderCss = emitLayerOrderCss(opts.layerOrder);
    const layerOrderHash = hashContent(layerOrderCss);
    records.set(layerOrderHash, { css: layerOrderCss, classes: [] });

    // `transformIndexHtml` is Vite-only. When it fires, the layer-order
    // declaration is already in <head> and there's no point prepending a
    // duplicate virtual CSS import into every file that imports the Provider
    // — the browser would parse the same declaration twice. On non-Vite
    // bundlers (webpack/turbopack) `transformIndexHtml` never runs, so the
    // per-file import is the ONLY path that gets layer order into the
    // bundled CSS.
    let injectedViaHtml = false;

    return {
        name: 'vapor-style-macro',
        enforce: 'pre',

        vite: {
            transformIndexHtml(html) {
                injectedViaHtml = true;
                const tag = `<style>@layer ${opts.layerOrder.join(', ')};</style>`;
                // Inject immediately AFTER the opening <head> so the layer
                // order declaration is the FIRST stylesheet the browser
                // parses — before any <link rel="stylesheet"> that Vite
                // will inject into <head> later in the build.
                if (/(<head[^>]*>)/i.test(html)) {
                    return html.replace(/(<head[^>]*>)/i, `$1${tag}`);
                }
                return `${tag}${html}`;
            },
        },

        // unplugin 2.x pushes VirtualModulesPlugin into `compiler.options.plugins`
        // during its own `apply(compiler)` but never invokes `.apply()` on it.
        // In host environments that snapshot the plugin array before iterating
        // (Next.js's webpack pipeline included), the VMP never wires itself into
        // `compiler.inputFileSystem`, so writes vanish and the encoded
        // `_virtual_...css` path fails to resolve. Force-apply the VMP here —
        // its `afterEnvironment` hook is idempotent (guarded by
        // `_writeVirtualFile`).
        webpack(compiler) {
            const plugins = compiler.options.plugins as
                | Array<{ apply?: (c: unknown) => void; constructor?: { name?: string } } | null>
                | undefined;
            const vfs = plugins?.find((p) => p?.constructor?.name === 'VirtualModulesPlugin');

            if (vfs && typeof vfs.apply === 'function') {
                vfs.apply(compiler);
            }
        },

        resolveId(id) {
            if (id.startsWith(PUBLIC_PREFIX)) return id;
            return null;
        },

        loadInclude(id) {
            return id.startsWith(VIRTUAL_PREFIX);
        },

        load(id) {
            if (!id.startsWith(VIRTUAL_PREFIX)) return null;
            const hash = id.slice(VIRTUAL_PREFIX.length, -VIRTUAL_SUFFIX.length);
            const rec = records.get(hash);
            if (!rec) return null;
            return rec.css;
        },

        transformInclude(id) {
            const cleaned = id.split('?')[0];
            if (cleaned.startsWith(VIRTUAL_PREFIX)) return false;
            return opts.include(cleaned);
        },

        transform(code, id) {
            const filename = id.split('?')[0];
            const result = transform({
                source: code,
                filename,
                manifest: opts.manifest,
                obfuscate: opts.obfuscate,
                providerImportSource: opts.providerImportSource,
                providerImportName: opts.providerImportName,
            });

            if (result.errors.length) {
                const msg = result.errors
                    .map((e) => formatBuildError(e, code, filename))
                    .join('\n\n');
                this.error(msg);
                return null;
            }

            const prependLines: string[] = [];

            // Non-Vite adapters (webpack/turbopack) have no HTML injection
            // hook. Piggyback on every file that imports the Provider so
            // the layer-order declaration lands in the bundled CSS.
            // Content-hashed virtual module → bundler dedupes across chunks.
            if (result.hasProviderImport && !injectedViaHtml) {
                prependLines.push(`import "${PUBLIC_PREFIX}${layerOrderHash}${VIRTUAL_SUFFIX}";`);
            }

            if (result.css) {
                const hash = hashContent(result.css);
                records.set(hash, { css: result.css, classes: result.classes });
                if (opts.themeStylesImport) {
                    prependLines.push(`import "${opts.themeStylesImport}";`);
                }
                prependLines.push(`import "${PUBLIC_PREFIX}${hash}${VIRTUAL_SUFFIX}";`);
            }

            if (!prependLines.length) return null;

            return {
                code: prependLines.join('\n') + '\n' + result.code,
                map: null,
            };
        },
    };
});

export interface VaporStyleOptions {
    /**
     * Token manifest object. Defaults to the export from `@vapor-ui/tokens`.
     * Pass a custom manifest to use an alternative token set.
     */
    manifest?: ManifestShape;
    /**
     * Optional side-effect import injected at the top of every file that uses
     * the macro. Set to a module specifier to auto-load extra CSS (e.g. legacy
     * `@vapor-ui/core/styles.css`). Defaults to `undefined` — no injection.
     *
     * Prefer rendering a Vapor Provider that owns theme/layer/variable CSS
     * over enabling this.
     */
    themeStylesImport?: string | false;
    include?: (id: string) => boolean;
    /**
     * When `true`, emit short hashed class names (e.g. `_a3k9f2x`) instead of
     * readable atomic names (e.g. `_lg-bg-background-success-100`).
     * Defaults to `process.env.NODE_ENV === 'production'`.
     */
    obfuscate?: boolean;

    /**
     * Module specifier(s) that expose the layer-owning Provider component.
     * When any of these appear alongside a matching `providerImportName`,
     * the adapter injects the layer-order CSS import into that file so
     * webpack/turbopack builds emit the `@layer …;` declaration in the
     * bundled CSS (Vite uses `transformIndexHtml` instead).
     *
     * Defaults to `['@vapor-ui/core', '@vapor-ui/core/theme-provider']`.
     */
    providerImportSource?: string[];
    /** Provider component name. Defaults to `'ThemeProvider'`. */
    providerImportName?: string;
    /**
     * Cascade layer declaration order. The plugin emits
     * `@layer <a>, <b>, …;` — the FIRST occurrence wins per CSS spec, so
     * this array determines the effective priority of each named layer.
     *
     * Defaults to `['vapor-theme', 'vapor-reset', 'vapor-components', 'vapor-utilities']`.
     */
    layerOrder?: string[];
}
