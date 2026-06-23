import type { ManifestShape } from '@vapor-ui/tokens';

export interface VaporStyleOptions {
    /**
     * Token manifest object. Defaults to the export from `@vapor-ui/tokens`.
     * Pass a custom manifest to use an alternative token set.
     */
    manifest?: ManifestShape;
    /**
     * Module specifier(s) the `$style` symbol is imported from. Pass an array
     * to recognize multiple subpaths. Defaults to
     * `['@vapor-ui/core', '@vapor-ui/core/style']`.
     */
    importSource?: string;
    importName?: string;
    /**
     * Side-effect import injected at the top of every file that uses the macro,
     * so theme CSS vars (`--vapor-*`) are loaded without manual `import` lines.
     * Set to `false` to disable. Defaults to `<importSource>/styles.css`.
     */
    themeStylesImport?: string | false;
    include?: (id: string) => boolean;
    /**
     * When `true`, emit short hashed class names (e.g. `_a3k9f2x`) instead of
     * readable atomic names (e.g. `_lg-bg-background-success-100`).
     * Defaults to `process.env.NODE_ENV === 'production'`.
     */
    obfuscate?: boolean;
}

export interface ResolvedOptions {
    manifest: ManifestShape;
    importSource: string | string[];
    importName: string;
    themeStylesImport: string | null;
    include: (id: string) => boolean;
    obfuscate: boolean;
}

export interface FileRecord {
    css: string;
    classes: string[];
}
