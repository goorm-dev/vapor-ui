import { createHash } from 'node:crypto';
import { createUnplugin } from 'unplugin';

import { emitLayerOrderCss, resolveOptions } from '~/bundler/plugin-shared';
import type { FileRecord, VaporStyleOptions } from '~/bundler/unplugin-types';
import { formatBuildError } from '~/compiler/code-frame';
import { transform } from '~/compiler/transform';

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
let discoveredLayerOrder: string[] | null = null;

export default createUnplugin<VaporStyleOptions | undefined>((rawOpts) => {
    const opts = resolveOptions(rawOpts ?? {});

    return {
        name: 'vapor-style-macro',
        enforce: 'pre',

        vite: {
            transformIndexHtml(html) {
                if (!discoveredLayerOrder) return;
                const tag = `<style>@layer ${discoveredLayerOrder.join(', ')};</style>`;
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
                importSource: opts.importSource,
                importName: opts.importName,
                obfuscate: opts.obfuscate,
                providerImportSource: opts.providerImportSource,
                providerImportName: opts.providerImportName,
                layerRegistry: opts.layerRegistry,
            });

            if (result.errors.length) {
                const msg = result.errors
                    .map((e) => formatBuildError(e, code, filename))
                    .join('\n\n');
                this.error(msg);
                return null;
            }

            const prependLines: string[] = [];

            if (result.layerOrder) {
                if (discoveredLayerOrder) {
                    // Conflicting declarations across the app — first one wins,
                    // second is ignored. Warn via Rollup's context.
                    if (discoveredLayerOrder.join(',') !== result.layerOrder.join(',')) {
                        this.warn(
                            `[vapor-style-macro] Multiple \`<${opts.providerImportName} layer={...}>\` occurrences with different orders detected. First occurrence wins.`,
                        );
                    }
                } else {
                    discoveredLayerOrder = result.layerOrder;
                }
                const css = emitLayerOrderCss(result.layerOrder);
                const layerHash = hashContent(css);
                records.set(layerHash, { css, classes: [] });
                // Also emit as a virtual CSS import so environments without an
                // `index.html` (e.g. library builds) still see the layer-order
                // declaration in the bundled CSS.
                prependLines.push(`import "${PUBLIC_PREFIX}${layerHash}${VIRTUAL_SUFFIX}";`);
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
