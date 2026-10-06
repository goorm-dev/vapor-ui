import type { Reporter } from '#reporter';
import { type Node, type Type, TypeFormatFlags } from 'ts-morph';

/**
 * Maps a base-ui type (by qualified path or symbol name) to the public vapor-ui
 * path that documentation should display. Built per source file by base-ui-mapper.
 */
interface BaseUiTypeEntry {
    type: Type;
    vaporPath: string;
    /** The vapor-ui namespace that declares the alias, e.g. `CollapsibleRoot`. */
    namespace: string;
}

export interface BaseUiTypeMap {
    [normalizedPath: string]: BaseUiTypeEntry;
}

export const TYPE_FORMAT_FLAGS =
    TypeFormatFlags.UseAliasDefinedOutsideCurrentScope |
    TypeFormatFlags.NoTruncation |
    TypeFormatFlags.WriteTypeArgumentsOfSignature;

export interface PrintOptions {
    baseUiMap?: BaseUiTypeMap;
    contextNode?: Node;
    reporter?: Reporter;
    /** The component namespace being documented. Its alias names win when several fit. */
    namespace?: string;
}

/**
 * One branch of the type-printing chain.
 *
 * `resolve` returns null to mean "not my type" and hand over to the next
 * resolver, so a branch decides applicability and produces its output in a
 * single pass — no `isX` check that the caller has to repeat.
 */
export interface Resolver {
    name: string;
    resolve(type: Type, ctx: ResolverContext): string | null;
}

export interface ResolverContext extends PrintOptions {
    /** Pre-computed `type.getText(...)`, printed as is when a resolver keeps the type whole. */
    rawText: string;
    resolveType: (type: Type, options: PrintOptions) => string;
}

export const PRESERVED_REACT_ALIASES = new Set([
    'ReactNode',
    'ReactElement',
    'ReactChild',
    'ReactFragment',
    'Ref',
]);
