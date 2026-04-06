import type { Type } from 'ts-morph';

// ──────────────────────────────────────────────────────────────
// Parsed (raw AST extraction results)
// ──────────────────────────────────────────────────────────────

export interface ParsedProp {
    name: string;
    typeString: string;
    isOptional: boolean;
    description?: string;
    defaultValue?: string;
    declarationFilePath?: string;
}

export interface ParsedComponent {
    name: string;
    description?: string;
    props: ParsedProp[];
}

// ──────────────────────────────────────────────────────────────
// Models (post-transform)
// ──────────────────────────────────────────────────────────────

export type PropCategory = 'required' | 'variants' | 'state' | 'custom' | 'base-ui' | 'composition';

export interface PropModel {
    name: string;
    types: string[];
    required: boolean;
    description?: string;
    defaultValue?: string;
    category: PropCategory;
}

export interface ComponentModel {
    name: string;
    displayName: string;
    description?: string;
    props: PropModel[];
}

// ──────────────────────────────────────────────────────────────
// Pipeline config
// ──────────────────────────────────────────────────────────────

export interface ParseOptions {
    filterExternal: boolean;
    filterHtml: boolean;
    filterSprinkles: boolean;
    includeHtml?: string[];
    include?: string[];
    verbose?: boolean;
}

export interface BaseUiTypeEntry {
    type: Type;
    vaporPath: string;
}

export interface BaseUiTypeMap {
    [normalizedPath: string]: BaseUiTypeEntry;
}
