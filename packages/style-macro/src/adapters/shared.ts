import type { ManifestShape } from '@vapor-ui/tokens';
import { manifest as defaultManifest } from '@vapor-ui/tokens';

import type { VaporStyleOptions } from './unplugin';

export const DEFAULT_LAYER_ORDER: readonly string[] = [
    'vapor-theme',
    'vapor-reset',
    'vapor-components',
    'vapor-utilities',
];

interface ResolvedOptions {
    manifest: ManifestShape;
    themeStylesImport: string | null;
    include: (id: string) => boolean;
    obfuscate: boolean;
    providerImportSource: string[];
    providerImportName: string;
    layerOrder: string[];
}

export const DEFAULT_PROVIDER_SOURCES = ['@vapor-ui/core', '@vapor-ui/core/theme-provider'];

export function defaultInclude(id: string): boolean {
    if (id.includes('node_modules')) return false;
    return /\.(?:tsx?|jsx?|mts|mjs|cts|cjs)$/.test(id);
}

export function resolveOptions(opts: VaporStyleOptions): ResolvedOptions {
    const themeStylesImport =
        opts.themeStylesImport === false || opts.themeStylesImport === undefined
            ? null
            : opts.themeStylesImport;
    const obfuscate = opts.obfuscate ?? process.env.NODE_ENV === 'production';
    const providerImportSourceRaw = opts.providerImportSource ?? DEFAULT_PROVIDER_SOURCES;
    const providerImportSource = Array.isArray(providerImportSourceRaw)
        ? providerImportSourceRaw
        : [providerImportSourceRaw];
    const layerOrder = opts.layerOrder ?? [...DEFAULT_LAYER_ORDER];

    return {
        manifest: opts.manifest ?? defaultManifest,
        themeStylesImport,
        include: opts.include ?? defaultInclude,
        obfuscate,
        providerImportSource,
        providerImportName: opts.providerImportName ?? 'ThemeProvider',
        layerOrder,
    };
}

export function emitLayerOrderCss(order: string[]): string {
    return `@layer ${order.join(', ')};\n`;
}
