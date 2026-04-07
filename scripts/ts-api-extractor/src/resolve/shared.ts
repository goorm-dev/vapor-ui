import { type Node, type Type, TypeFormatFlags } from 'ts-morph';

import type { BaseUiTypeMap } from '~/models/pipeline';

export const TYPE_FORMAT_FLAGS =
    TypeFormatFlags.UseAliasDefinedOutsideCurrentScope |
    TypeFormatFlags.NoTruncation |
    TypeFormatFlags.WriteTypeArgumentsOfSignature;

export type ResolveTypeFn = (
    type: Type,
    baseUiMap?: BaseUiTypeMap,
    contextNode?: Node,
    verbose?: boolean,
) => string;

export interface ResolverContext {
    type: Type;
    rawText: string;
    baseUiMap?: BaseUiTypeMap;
    contextNode?: Node;
    verbose?: boolean;
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
