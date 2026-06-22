import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { createUnplugin } from 'unplugin';

import { transform } from './transform';
import { loadManifest } from './tokens';
import { formatBuildError } from './code-frame';
import type { ResolvedOptions, VaporStyleOptions, FileRecord } from './unplugin-types';

const VIRTUAL_PREFIX = '\0virtual:vapor-style/';
const VIRTUAL_SUFFIX = '.css';
const PUBLIC_PREFIX = 'virtual:vapor-style/';

function defaultInclude(id: string): boolean {
    if (id.includes('node_modules')) return false;
    return /\.(?:tsx?|jsx?|mts|mjs|cts|cjs)$/.test(id);
}

function resolveOptions(opts: VaporStyleOptions): ResolvedOptions {
    const require_ = createRequire(import.meta.url);
    const manifestPath =
        opts.tokensManifestPath ?? require_.resolve('@vapor-ui/core/tokens.manifest.json');
    return {
        manifest: loadManifest(manifestPath),
        importSource: opts.importSource ?? '@vapor-ui/core',
        importName: opts.importName ?? '$style',
        include: opts.include ?? defaultInclude,
    };
}

function hashContent(input: string): string {
    return createHash('sha1').update(input).digest('hex').slice(0, 12);
}

export default createUnplugin<VaporStyleOptions | undefined>((rawOpts) => {
    const opts = resolveOptions(rawOpts ?? {});
    const records = new Map<string, FileRecord>();

    return {
        name: 'vapor-style-macro',
        enforce: 'pre',

        resolveId(id) {
            if (id.startsWith(PUBLIC_PREFIX)) return '\0' + id;
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
            });
            if (result.errors.length) {
                const msg = result.errors
                    .map((e) => formatBuildError(e, code, filename))
                    .join('\n\n');
                this.error(msg);
                return null;
            }
            if (!result.css) return null;
            const hash = hashContent(result.css);
            records.set(hash, { css: result.css, classes: result.classes });
            const importLine = `import "${PUBLIC_PREFIX}${hash}${VIRTUAL_SUFFIX}";\n`;
            return { code: importLine + result.code, map: null };
        },
    };
});
