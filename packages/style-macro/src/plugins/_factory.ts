import { createHash } from 'node:crypto';
import { createUnplugin } from 'unplugin';

import { formatBuildError } from '~/compilers/code-frame';
import { transform } from '~/compilers/transform';
import { type ColorSchemeScriptOpts, buildColorSchemeScript } from '~/helpers/fouc-script';
import { emitLayerOrderCss, resolveOptions } from '~/plugins/_options';

interface FileRecord {
    css: string;
    classes: string[];
}

const VIRTUAL_PREFIX = '~vapor-style/';
const VIRTUAL_SUFFIX = '.css';
const PUBLIC_PREFIX = '~vapor-style/';

function hashContent(input: string): string {
    return createHash('sha1').update(input).digest('hex').slice(0, 12);
}

const records = new Map<string, FileRecord>();

export default createUnplugin<VaporPluginOptions | undefined>((rawOpts) => {
    const opts = resolveOptions(rawOpts ?? {});
    const layerOrderCss = emitLayerOrderCss(opts.layerOrder);
    const layerOrderHash = hashContent(layerOrderCss);
    records.set(layerOrderHash, { css: layerOrderCss, classes: [] });

    let injectedViaHtml = false;

    return {
        name: 'vapor-style-macro',
        enforce: 'pre',

        vite: {
            transformIndexHtml(html) {
                injectedViaHtml = true;
                const layerTag = `<style>@layer ${opts.layerOrder.join(', ')};</style>`;

                const scriptTag = opts.injectColorScheme
                    ? `<script>${buildColorSchemeScript(opts.injectColorScheme)}</script>`
                    : '';

                const injection = scriptTag + layerTag;
                if (/(<head[^>]*>)/i.test(html)) {
                    return html.replace(/(<head[^>]*>)/i, `$1${injection}`);
                }
                return `${injection}${html}`;
            },
        },

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
                hash: opts.hash,
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

export interface VaporPluginOptions {
    themeStylesImport?: string | false;
    include?: (id: string) => boolean;
    hash?: boolean;
    layerOrder?: string[];
    injectColorScheme?: boolean | ColorSchemeScriptOpts;
}
