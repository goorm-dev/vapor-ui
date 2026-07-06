import type { ManifestShape } from '@vapor-ui/tokens';

export interface VaporStyleOptions {
    /**
     * Token manifest object. Defaults to the export from `@vapor-ui/tokens`.
     * Pass a custom manifest to use an alternative token set.
     */
    manifest?: ManifestShape;
    /**
     * Module specifier(s) the `$style` symbol is imported from. Pass an array
     * to recognize multiple subpaths. Defaults to `'@vapor-ui/style-macro'`.
     */
    importSource?: string | string[];
    importName?: string;
    /**
     * Optional side-effect import injected at the top of every file that uses
     * the macro. Set to a module specifier to auto-load extra CSS (e.g. legacy
     * `@vapor-ui/core/styles.css`). Defaults to `undefined` — no injection.
     *
     * Prefer rendering a Vapor Provider that owns theme/layer/variable CSS
     * over enabling this.
     */
    themeStylesImport?: string | false;
    include?: (id: string) => boolean;
    /**
     * When `true`, emit short hashed class names (e.g. `_a3k9f2x`) instead of
     * readable atomic names (e.g. `_lg-bg-background-success-100`).
     * Defaults to `process.env.NODE_ENV === 'production'`.
     */
    obfuscate?: boolean;

    /**
     * Module specifier(s) that expose the layer-owning Provider component.
     * When any of these appear alongside a matching `providerImportName`, the
     * plugin looks for `<Provider layer={...}>` JSX and materializes the
     * static layer-order expression as a virtual CSS module.
     *
     * Defaults to `['@vapor-ui/core', '@vapor-ui/core/theme-provider']`.
     */
    providerImportSource?: string | string[];
    /** Provider component name. Defaults to `'ThemeProvider'`. */
    providerImportName?: string;
    /**
     * Layer registry used to resolve `<param>.<key>` accesses inside a
     * `layer` prop arrow function. Defaults to Vapor's built-in registry
     * (`theme`, `reset`, `components`, `utilities`).
     */
    layerRegistry?: Record<string, string>;
}

export interface ResolvedOptions {
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

export interface FileRecord {
    css: string;
    classes: string[];
}
