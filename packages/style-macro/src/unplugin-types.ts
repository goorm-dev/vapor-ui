import type { ManifestShape } from './types';

export interface VaporStyleOptions {
    tokensManifestPath?: string;
    importSource?: string;
    importName?: string;
    /**
     * Side-effect import injected at the top of every file that uses the macro,
     * so theme CSS vars (`--vapor-*`) are loaded without manual `import` lines.
     * Set to `false` to disable. Defaults to `<importSource>/styles.css`.
     */
    themeStylesImport?: string | false;
    include?: (id: string) => boolean;
}

export interface ResolvedOptions {
    manifest: ManifestShape;
    importSource: string;
    importName: string;
    themeStylesImport: string | null;
    include: (id: string) => boolean;
}

export interface FileRecord {
    css: string;
    classes: string[];
}
