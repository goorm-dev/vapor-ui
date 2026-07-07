import type { ManifestShape } from '@vapor-ui/tokens';
import { manifest as defaultManifest } from '@vapor-ui/tokens';

import type { VaporStyleOptions } from './unplugin';

interface ResolvedOptions {
    manifest: ManifestShape;
    importSource: string | string[];
    importName: string;
    themeStylesImport: string | null;
    include: (id: string) => boolean;
    obfuscate: boolean;
    providerImportSource: string[];
    providerImportName: string;
    layerRegistry: Record<string, string>;
}

export const DEFAULT_PROVIDER_SOURCES = ['@vapor-ui/core', '@vapor-ui/core/theme-provider'];

export const DEFAULT_LAYER_REGISTRY: Record<string, string> = {
    theme: 'vapor-theme',
    reset: 'vapor-reset',
    components: 'vapor-components',
    utilities: 'vapor-utilities',
};

export function defaultInclude(id: string): boolean {
    if (id.includes('node_modules')) return false;
    return /\.(?:tsx?|jsx?|mts|mjs|cts|cjs)$/.test(id);
}

export function resolveOptions(opts: VaporStyleOptions): ResolvedOptions {
    const importSource = opts.importSource || '@vapor-ui/style-macro';
    const themeStylesImport =
        opts.themeStylesImport === false || opts.themeStylesImport === undefined
            ? null
            : opts.themeStylesImport;
    const obfuscate = opts.obfuscate ?? process.env.NODE_ENV === 'production';
    const providerImportSourceRaw = opts.providerImportSource ?? DEFAULT_PROVIDER_SOURCES;
    const providerImportSource = Array.isArray(providerImportSourceRaw)
        ? providerImportSourceRaw
        : [providerImportSourceRaw];

    return {
        manifest: opts.manifest ?? defaultManifest,
        importSource,
        importName: opts.importName ?? '$style',
        themeStylesImport,
        include: opts.include ?? defaultInclude,
        obfuscate,
        providerImportSource,
        providerImportName: opts.providerImportName ?? 'ThemeProvider',
        layerRegistry: opts.layerRegistry ?? DEFAULT_LAYER_REGISTRY,
    };
}

export function emitLayerOrderCss(order: string[]): string {
    return `@layer ${order.join(', ')};\n`;
}
