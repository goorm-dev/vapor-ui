/**
 * Type resolver module
 *
 * Converts ts-morph Type objects to type strings.
 */
import { type Node, type Type, TypeFormatFlags } from 'ts-morph';

import type { BaseUiTypeMap } from '~/core/parser/types';

import { extractSimplifiedTypeName, resolveBaseUiType } from './base-ui-mapper';

/**
 * TypeFormatFlags combination
 */
const TYPE_FORMAT_FLAGS =
    TypeFormatFlags.UseAliasDefinedOutsideCurrentScope |
    TypeFormatFlags.NoTruncation |
    TypeFormatFlags.WriteTypeArgumentsOfSignature;

function extractPropsName(typeText: string): string | null {
    const match = typeText.match(/["']([^"']+)["']\)\.(\w+)\.Props/);
    if (match) {
        return `${match[2]}.Props`;
    }
    return null;
}

function simplifyReactElementType(type: Type): string | null {
    const symbol = type.getSymbol() || type.getAliasSymbol();
    if (!symbol) return null;

    const name = symbol.getName();
    if (name !== 'ReactElement') return null;

    const typeArgs = type.getTypeArguments();
    if (typeArgs.length === 0) return 'ReactElement';

    const innerType = typeArgs[0];
    const innerText = innerType.getText();

    if (innerText.includes('ForwardRefExoticComponent')) {
        const propsName = extractPropsName(innerText);
        if (propsName) {
            return `ReactElement<${propsName}>`;
        }
    }

    return 'ReactElement';
}

/**
 * Parse function type and recursively convert parameters and return type.
 */
function resolveFunctionType(
    type: Type,
    baseUiMap?: BaseUiTypeMap,
    contextNode?: Node,
): string | null {
    const callSignatures = type.getCallSignatures();
    if (callSignatures.length === 0) return null;

    const signature = callSignatures[0];
    const params = signature.getParameters();
    const returnType = signature.getReturnType();

    // Convert parameter types
    const paramStrings = params.map((param) => {
        const paramName = param.getName();
        const declarations = param.getDeclarations();

        const node = declarations[0] ?? param.getValueDeclaration();
        if (!node) {
            const paramTypeText = param.getTypeAtLocation(signature.getDeclaration()!).getText();
            if (paramTypeText.includes('@base-ui')) {
                return `${paramName}: ${extractSimplifiedTypeName(paramTypeText)}`;
            }
            return `${paramName}: ${paramTypeText}`;
        }

        const paramType = param.getTypeAtLocation(node);

        // Check if base-ui type using AST
        if (baseUiMap) {
            const vaporPath = resolveBaseUiType(paramType, baseUiMap);
            if (vaporPath) {
                return `${paramName}: ${vaporPath}`;
            }
        }

        // Try mapping from parameter declaration if no alias
        if (baseUiMap && !paramType.getAliasSymbol()) {
            const paramDecls = param.getDeclarations();
            if (paramDecls.length > 0) {
                const declText = paramDecls[0].getText();
                const typeMatch = declText.match(/:\s*(\w+)$/);
                if (typeMatch) {
                    const typeName = typeMatch[1];
                    const matchingKey = Object.keys(baseUiMap).find((key) =>
                        key.endsWith(`.${typeName}`),
                    );
                    if (matchingKey) {
                        return `${paramName}: ${baseUiMap[matchingKey].vaporPath}`;
                    }
                }
            }
        }

        const resolvedParamType = resolveType(paramType, baseUiMap, contextNode);
        return `${paramName}: ${resolvedParamType}`;
    });

    // Convert return type
    const resolvedReturnType = resolveType(returnType, baseUiMap, contextNode);

    // Wrap union return types in parentheses
    const needsParens = resolvedReturnType.includes(' | ');
    const wrappedReturn = needsParens ? `(${resolvedReturnType})` : resolvedReturnType;

    return `(${paramStrings.join(', ')}) => ${wrappedReturn}`;
}

/**
 * Preserve Ref<T> type without spreading.
 */
function preserveRefType(typeText: string): string | null {
    const refMatch = typeText.match(/^(React\.)?Ref<([^>]+)>(\s*\|\s*undefined)?$/);
    if (refMatch) {
        return `Ref<${refMatch[2]}>`;
    }
    return null;
}

// React type aliases to preserve without spreading
const PRESERVED_REACT_ALIASES = new Set([
    'ReactNode',
    'ReactElement',
    'ReactChild',
    'ReactFragment',
]);

/**
 * Type resolver plugin interface.
 */
export interface TypeResolverPlugin {
    name: string;
    resolve(ctx: TypeResolverContext): string | null;
}

export interface TypeResolverContext {
    type: Type;
    rawText: string;
    baseUiMap?: BaseUiTypeMap;
    contextNode?: Node;
}

// --- Built-in resolver plugins ---

const refTypeResolver: TypeResolverPlugin = {
    name: 'ref-type',
    resolve: ({ rawText }) => preserveRefType(rawText),
};

const reactAliasResolver: TypeResolverPlugin = {
    name: 'react-alias',
    resolve: ({ type }) => {
        const aliasSymbol = type.getAliasSymbol();
        if (aliasSymbol && PRESERVED_REACT_ALIASES.has(aliasSymbol.getName())) {
            return aliasSymbol.getName();
        }
        return null;
    },
};

const primitiveResolver: TypeResolverPlugin = {
    name: 'primitives',
    resolve: ({ type }) => {
        if (type.isBooleanLiteral()) return type.getText();
        if (type.isLiteral()) {
            const value = type.getLiteralValue();
            return typeof value === 'string' ? `"${value}"` : String(value);
        }
        if (type.isUndefined()) return 'undefined';
        if (type.isNull()) return 'null';
        if (type.isBoolean()) return 'boolean';
        if (type.isString()) return 'string';
        if (type.isNumber()) return 'number';
        return null;
    },
};

const reactElementResolver: TypeResolverPlugin = {
    name: 'react-element',
    resolve: ({ type }) => simplifyReactElementType(type),
};

const functionTypeResolver: TypeResolverPlugin = {
    name: 'function-type',
    resolve: ({ type, baseUiMap, contextNode }) =>
        resolveFunctionType(type, baseUiMap, contextNode),
};

const baseUiTypeResolver: TypeResolverPlugin = {
    name: 'base-ui-type',
    resolve: ({ type, rawText, baseUiMap }) => {
        if (!rawText.includes('@base-ui')) return null;
        if (baseUiMap) {
            const vaporPath = resolveBaseUiType(type, baseUiMap);
            if (vaporPath) return vaporPath;
        }
        return simplifyNodeModulesImports(rawText);
    },
};

const importPathResolver: TypeResolverPlugin = {
    name: 'import-path',
    resolve: ({ rawText }) => {
        if (!rawText.includes('import(')) return null;
        return simplifyNodeModulesImports(rawText);
    },
};

/**
 * Default resolver chain.
 */
const DEFAULT_RESOLVER_CHAIN: TypeResolverPlugin[] = [
    refTypeResolver,
    reactAliasResolver,
    primitiveResolver,
    reactElementResolver,
    functionTypeResolver,
    baseUiTypeResolver,
    importPathResolver,
];

export function resolveType(
    type: Type,
    baseUiMap?: BaseUiTypeMap,
    contextNode?: Node,
    verbose?: boolean,
): string {
    const rawText = contextNode ? type.getText(contextNode, TYPE_FORMAT_FLAGS) : type.getText();
    const ctx: TypeResolverContext = { type, rawText, baseUiMap, contextNode };

    for (const plugin of DEFAULT_RESOLVER_CHAIN) {
        const result = plugin.resolve(ctx);
        if (result !== null) {
            if (verbose) {
                console.error(`[verbose] resolveType: "${rawText}" → resolved by ${plugin.name}`);
            }
            return result;
        }
    }

    if (verbose) {
        console.error(`[verbose] resolveType: "${rawText}" → fallback (no plugin matched)`);
    }

    // Fallback: Clean up ForwardRef/ReactElement generics
    return simplifyReactElementGeneric(simplifyForwardRefType(rawText));
}

export function simplifyNodeModulesImports(typeText: string): string {
    return typeText.replace(/import\(["'].*?["']\)\./g, '');
}

/**
 * Remove second type parameter from ReactElement.
 */
export function simplifyReactElementGeneric(typeText: string): string {
    return typeText.replace(/,\s*string \| React\.JSXElementConstructor<any>>/g, '>');
}

/**
 * Simplify ForwardRefExoticComponent type to Props.
 */
export function simplifyForwardRefType(typeText: string): string {
    return typeText.replace(
        /React\.ForwardRefExoticComponent<Omit<([^,]+\.Props), "ref"> & React\.RefAttributes<[^>]+>>/g,
        '$1',
    );
}
