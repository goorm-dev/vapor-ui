import { type Node, type Type, TypeFormatFlags } from 'ts-morph';

import type { Reporter } from '~/domain/reporter';

/**
 * Maps a base-ui type (by qualified path or symbol name) to the public vapor-ui
 * path that documentation should display. Built per source file by base-ui-mapper.
 */
export interface BaseUiTypeEntry {
    type: Type;
    vaporPath: string;
}

export interface BaseUiTypeMap {
    [normalizedPath: string]: BaseUiTypeEntry;
}

export const TYPE_FORMAT_FLAGS =
    TypeFormatFlags.UseAliasDefinedOutsideCurrentScope |
    TypeFormatFlags.NoTruncation |
    TypeFormatFlags.WriteTypeArgumentsOfSignature;

export type ResolveTypeFn = (
    type: Type,
    baseUiMap?: BaseUiTypeMap,
    contextNode?: Node,
    reporter?: Reporter,
) => string;

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

export interface ResolverContext {
    /** Pre-computed `type.getText(...)`, used by the text-matching resolvers. */
    rawText: string;
    baseUiMap?: BaseUiTypeMap;
    contextNode?: Node;
    reporter?: Reporter;
    resolveType: ResolveTypeFn;
}

export const PRESERVED_REACT_ALIASES = new Set([
    'ReactNode',
    'ReactElement',
    'ReactChild',
    'ReactFragment',
]);

export function extractPropsName(typeText: string): string | null {
    const match = typeText.match(/["']([^"']+)["']\)\.(\w+)\.Props/);
    if (match) {
        return `${match[2]}.Props`;
    }

    return null;
}

export function simplifyNodeModulesImports(typeText: string): string {
    return typeText.replace(/import\(["'].*?["']\)\./g, '');
}

export function simplifyReactElementGeneric(typeText: string): string {
    return typeText.replace(/,\s*string \| React\.JSXElementConstructor<any>>/g, '>');
}

export function simplifyForwardRefType(typeText: string): string {
    return typeText.replace(
        /React\.ForwardRefExoticComponent<Omit<([^,]+\.Props), "ref"> & React\.RefAttributes<[^>]+>>/g,
        '$1',
    );
}
