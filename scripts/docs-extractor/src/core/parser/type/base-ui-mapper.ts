/**
 * Base-UI type mapper module
 *
 * Extracts type information from base-ui imports and maps them to vapor-ui paths.
 */
import fs from 'node:fs';
import {
    type ImportSpecifier,
    type ModuleDeclaration,
    type SourceFile,
    SyntaxKind,
    type Type,
    type TypeAliasDeclaration,
} from 'ts-morph';

import type { BaseUiTypeMap } from '~/core/parser/types';

/**
 * Extract base-ui qualified path from Type object using AST.
 */
function getBaseUiQualifiedPath(type: Type): string | null {
    for (const symbol of [type.getSymbol(), type.getAliasSymbol()]) {
        if (!symbol) continue;

        const fqn = symbol.getFullyQualifiedName();

        // FQN format: "module/path".Namespace.Type
        if (!fqn.startsWith('"')) continue;

        const closingQuote = fqn.indexOf('"', 1);
        if (closingQuote === -1) continue;

        // Only process types declared in @base-ui module
        const modulePath = fqn.substring(1, closingQuote);
        if (!modulePath.includes('@base-ui')) continue;

        // "module/path".Namespace.Type → Namespace.Type
        if (closingQuote + 2 > fqn.length) continue;
        return fqn.substring(closingQuote + 2);
    }

    return null;
}

/**
 * Recursively collect nested types from ImportSpecifier.
 */
function collectNestedTypes(
    importSpecifier: ImportSpecifier,
    type: Type,
    basePath: string,
    map: BaseUiTypeMap,
    depth: number = 0,
): void {
    // Max depth limit (prevent infinite recursion)
    if (depth > 3) return;

    const properties = type.getProperties();

    for (const prop of properties) {
        const propName = prop.getName();

        // Exclude internal properties
        if (propName.startsWith('_') || propName === 'prototype') continue;

        const propType = prop.getTypeAtLocation(importSpecifier);
        const vaporPath = `${basePath}.${propName}`;

        // Extract base-ui qualified path using AST
        const normalizedPath = getBaseUiQualifiedPath(propType);
        if (normalizedPath) {
            map[normalizedPath] = {
                type: propType,
                vaporPath,
            };
        }

        // Explore deeper levels
        collectNestedTypes(importSpecifier, propType, vaporPath, map, depth + 1);
    }
}

// File path based cache
interface CacheEntry {
    map: BaseUiTypeMap;
    mtime: number;
}

const baseUiTypeMapCache = new Map<string, CacheEntry>();

/**
 * Build type map from base-ui imports in source file.
 */
export function buildBaseUiTypeMap(sourceFile: SourceFile): BaseUiTypeMap {
    const filePath = sourceFile.getFilePath();
    const mtime = fs.statSync(filePath).mtimeMs;
    const cached = baseUiTypeMapCache.get(filePath);
    if (cached && cached.mtime === mtime) return cached.map;

    const map: BaseUiTypeMap = {};

    // Find @base-ui/react import
    const baseUiImport = sourceFile.getImportDeclaration((decl) =>
        decl.getModuleSpecifierValue().includes('@base-ui'),
    );

    if (baseUiImport) {
        const namedImports = baseUiImport.getNamedImports();

        for (const namedImport of namedImports) {
            // Use alias if available
            const alias = namedImport.getAliasNode()?.getText() ?? namedImport.getName();
            const importType = namedImport.getType();

            // Register top-level type (AST based)
            const normalizedPath = getBaseUiQualifiedPath(importType);
            if (normalizedPath) {
                map[normalizedPath] = {
                    type: importType,
                    vaporPath: alias,
                };
            }

            // Recursively collect nested properties
            collectNestedTypes(namedImport, importType, alias, map);
        }
    }

    // Collect re-exported type aliases from namespaces
    collectNamespaceTypeAliases(sourceFile, map);

    baseUiTypeMapCache.set(filePath, { map, mtime });
    return map;
}

/**
 * Resolve base-ui type to vapor-ui path.
 */
export function resolveBaseUiType(type: Type, map: BaseUiTypeMap): string | null {
    const normalizedPath = getBaseUiQualifiedPath(type);
    if (!normalizedPath) return null;

    return map[normalizedPath]?.vaporPath ?? null;
}

/**
 * Fallback: Extract last type name from base-ui type path.
 */
export function extractSimplifiedTypeName(typeText: string): string {
    const match = typeText.match(/\.(\w+)$/);
    return match ? match[1] : typeText;
}

/**
 * Collect exported type aliases from namespaces and add to base-ui type map.
 */
export function collectNamespaceTypeAliases(sourceFile: SourceFile, map: BaseUiTypeMap): void {
    const namespaces = sourceFile
        .getDescendantsOfKind(SyntaxKind.ModuleDeclaration)
        .filter((mod) => mod.isExported());

    // Extract component prefix from sibling namespaces
    const componentPrefix = findComponentPrefix(namespaces);

    for (const ns of namespaces) {
        const nsName = ns.getName();

        // Collect exported type aliases in namespace
        const typeAliases = ns.getTypeAliases().filter((ta) => ta.isExported());

        for (const typeAlias of typeAliases) {
            const aliasName = typeAlias.getName();
            const aliasType = typeAlias.getType();

            const normalizedPath = getBaseUiQualifiedPath(aliasType);
            const isBaseUiAlias = !normalizedPath && isBaseUiTypeAlias(typeAlias);

            if (normalizedPath || isBaseUiAlias) {
                // Convert ComponentNameRoot → ComponentName.Root
                const vaporPath = formatVaporTypePath(nsName, aliasName, componentPrefix);

                if (normalizedPath) {
                    map[normalizedPath] = { type: aliasType, vaporPath };
                }

                // Always add key by type name for fallback
                map[`${nsName}.${aliasName}`] = { type: aliasType, vaporPath };
            }
        }
    }
}

/**
 * Check if type alias references @base-ui package type.
 */
function isBaseUiTypeAlias(typeAlias: TypeAliasDeclaration): boolean {
    const aliasType = typeAlias.getType();

    // Check if symbol declaration is from @base-ui
    const symbol = aliasType.getSymbol() ?? aliasType.getAliasSymbol();
    if (symbol) {
        for (const decl of symbol.getDeclarations()) {
            if (decl.getSourceFile().getFilePath().includes('@base-ui')) return true;
        }
    }

    // Check union/intersection types
    if (aliasType.isUnion()) {
        return aliasType.getUnionTypes().some((t) => t.getText().includes('@base-ui'));
    }
    if (aliasType.isIntersection()) {
        return aliasType.getIntersectionTypes().some((t) => t.getText().includes('@base-ui'));
    }

    return false;
}

/**
 * Find common component prefix from namespace list.
 */
export function findComponentPrefix(namespaces: ModuleDeclaration[]): string | null {
    const nsNames = namespaces.map((ns) => ns.getName());
    if (nsNames.length < 2) return null;

    // Strategy 1: Extract prefix from shortest *Root namespace
    const rootNames = nsNames.filter((n) => n.endsWith('Root'));
    if (rootNames.length > 0) {
        rootNames.sort((a, b) => a.length - b.length);
        return rootNames[0].slice(0, -'Root'.length);
    }

    // Strategy 2: Common prefix (for cases without Root)
    const pascalNames = nsNames.filter((n) => /^[A-Z]/.test(n));
    if (pascalNames.length < 2) return null;

    const sorted = [...pascalNames].sort();
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    let commonLen = 0;
    while (
        commonLen < first.length &&
        commonLen < last.length &&
        first[commonLen] === last[commonLen]
    ) {
        commonLen++;
    }

    if (commonLen <= 1) return null;

    const prefix = first.substring(0, commonLen);

    // Verify PascalCase word boundary
    const allValidBoundary = sorted.every(
        (name) =>
            name.length === prefix.length ||
            (name.length > prefix.length &&
                name[prefix.length] >= 'A' &&
                name[prefix.length] <= 'Z'),
    );

    if (allValidBoundary) return prefix;

    return null;
}

/**
 * Convert internal namespace name to external accessible path.
 */
export function formatVaporTypePath(
    nsName: string,
    typeName: string,
    componentPrefix: string | null,
): string {
    if (
        componentPrefix &&
        nsName.startsWith(componentPrefix) &&
        nsName.length > componentPrefix.length
    ) {
        const partName = nsName.slice(componentPrefix.length);
        return `${componentPrefix}.${partName}.${typeName}`;
    }
    // Return original if no prefix
    return `${nsName}.${typeName}`;
}
