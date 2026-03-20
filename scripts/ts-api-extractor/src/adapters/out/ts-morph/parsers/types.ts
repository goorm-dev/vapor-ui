/**
 * Parser Layer Types
 *
 * Input and output types used by the parser layer.
 */
import type { Type } from 'ts-morph';

// ============================================================
// Parser Input Types
// ============================================================

/**
 * Props extraction options.
 */
export interface ExtractOptions {
    filterExternal?: boolean;
    filterHtml?: boolean;
    filterSprinkles?: boolean;
    includeHtmlWhitelist?: Set<string>;
    include?: string[];
    verbose?: boolean;
}

/**
 * Base-UI type entry with vapor-ui path mapping info.
 */
export interface BaseUiTypeEntry {
    type: Type;
    vaporPath: string; // "CollapsibleRoot.ChangeEventDetails"
}

/**
 * Base-UI type map keyed by normalized paths.
 */
export interface BaseUiTypeMap {
    [normalizedPath: string]: BaseUiTypeEntry;
}

