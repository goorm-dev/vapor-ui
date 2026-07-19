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
    layerOrder: string[];
}

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
    const layerOrder = opts.layerOrder ?? [...DEFAULT_LAYER_ORDER];

    return {
        manifest: opts.manifest ?? defaultManifest,
        themeStylesImport,
        include: opts.include ?? defaultInclude,
        obfuscate,
        layerOrder,
    };
}

export function emitLayerOrderCss(order: string[]): string {
    return `@layer ${order.join(', ')};\n`;
}
