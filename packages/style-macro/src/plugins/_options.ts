import type { ColorSchemeScriptOpts } from '~/helpers/fouc-script';

import type { VaporPluginOptions } from './_factory';

interface ResolvedOptions {
    themeStylesImport: string | null;
    include: (id: string) => boolean;
    hash: boolean;
    injectColorScheme: false | ColorSchemeScriptOpts;
}

export function defaultInclude(id: string): boolean {
    if (id.includes('node_modules')) return false;

    return /\.(?:tsx?|jsx?|mts|mjs|cts|cjs)$/.test(id);
}

export function resolveOptions(opts: VaporPluginOptions): ResolvedOptions {
    const {
        include = defaultInclude,
        themeStylesImport,
        hash = process.env.NODE_ENV === 'production',
        injectColorScheme = true,
    } = opts;

    return {
        include,
        hash,
        themeStylesImport: themeStylesImport || null,
        injectColorScheme:
            injectColorScheme === false
                ? false
                : injectColorScheme === true
                  ? {}
                  : injectColorScheme,
    };
}
