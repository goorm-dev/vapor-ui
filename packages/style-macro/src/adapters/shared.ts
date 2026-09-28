import type { VaporStyleOptions } from './unplugin';

export const DEFAULT_LAYER_ORDER: readonly string[] = [
    'vapor-theme',
    'vapor-reset',
    'vapor-components',
    'vapor-utilities',
];

interface ResolvedOptions {
    themeStylesImport: string | null;
    include: (id: string) => boolean;
    hash: boolean;
    layerOrder: string[];
}

export function defaultInclude(id: string): boolean {
    if (id.includes('node_modules')) return false;

    return /\.(?:tsx?|jsx?|mts|mjs|cts|cjs)$/.test(id);
}

export function resolveOptions(opts: VaporStyleOptions): ResolvedOptions {
    const {
        include = defaultInclude,
        themeStylesImport,
        hash = process.env.NODE_ENV === 'production',
        layerOrder = [...DEFAULT_LAYER_ORDER],
    } = opts;

    return {
        include,
        hash,
        layerOrder,
        themeStylesImport: themeStylesImport || null,
    };
}

export function emitLayerOrderCss(order: string[]): string {
    return `@layer ${order.join(', ')};\n`;
}
