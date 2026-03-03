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

// ============================================================
// Parser Output Types (Parsed)
// ============================================================

/**
 * Parsed prop data extracted from AST symbols.
 */
export interface ParsedProp {
    name: string;
    typeString: string;
    isOptional: boolean;
    description?: string;
    defaultValue?: string;
    declarationFilePath?: string;
}

/**
 * Parsed component data extracted from a namespace.
 */
export interface ParsedComponent {
    name: string;
    description?: string;
    props: ParsedProp[];
}

/**
 * Parsed result for a file.
 */
export interface ParsedFileResult {
    filePath: string;
    components: ParsedComponent[];
}
