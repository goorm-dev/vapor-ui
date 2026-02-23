/**
 * Base-UI type mapper module
 *
 * Extracts type information from base-ui imports and maps them to vapor-ui paths.
 *
 * Base-ui uses a merged declaration pattern (forwardRef component + namespace for types).
 * Because ts-morph's symbol.getExports() returns nothing for these merged symbols,
 * we scan vapor-ui's own namespace type aliases instead, which explicitly re-declare
 * base-ui types (e.g. `type State = BaseCollapsible.Root.State`).
 */
import fs from 'node:fs';
import path from 'node:path';
import {
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
 * Check if type alias references @base-ui package type.
 */
function isBaseUiTypeAlias(typeAlias: TypeAliasDeclaration): boolean {
    const aliasType = typeAlias.getType();

    const symbol = aliasType.getSymbol() ?? aliasType.getAliasSymbol();
    if (symbol) {
        for (const decl of symbol.getDeclarations()) {
            if (decl.getSourceFile().getFilePath().includes('@base-ui')) return true;
        }
    }

    if (aliasType.isUnion()) {
        return aliasType.getUnionTypes().some((t) => t.getText().includes('@base-ui'));
    }
    if (aliasType.isIntersection()) {
        return aliasType.getIntersectionTypes().some((t) => t.getText().includes('@base-ui'));
    }

    return false;
}

// ============================================================
// Barrel name resolution
// ============================================================

/**
 * Build a map from internal component names to their public barrel export paths.
 *
 * Reads index.ts and index.parts.ts in the same directory as the source file to
 * determine the authoritative public names (e.g. CollapsibleRoot → Collapsible.Root).
 */
function buildBarrelNameMap(sourceFile: SourceFile): Record<string, string> {
    const dir = path.dirname(sourceFile.getFilePath());
    const project = sourceFile.getProject();

    // Step 1: Read index.ts — find "export * as {PublicName} from './index.parts'"
    const indexFile = project.addSourceFileAtPathIfExists(path.join(dir, 'index.ts'));
    if (!indexFile) return {};

    let publicName: string | null = null;
    for (const exportDecl of indexFile.getExportDeclarations()) {
        const moduleSpec = exportDecl.getModuleSpecifierValue();
        if (!moduleSpec?.includes('index.parts')) continue;

        const nsExport = exportDecl.getNamespaceExport();
        if (nsExport) {
            publicName = nsExport.getName();
            break;
        }
    }
    if (!publicName) return {};

    // Step 2: Read index.parts.ts — find "export { InternalName as PartName }"
    const partsFile = project.addSourceFileAtPathIfExists(path.join(dir, 'index.parts.ts'));
    if (!partsFile) return {};

    const nameMap: Record<string, string> = {};
    for (const exportDecl of partsFile.getExportDeclarations()) {
        for (const namedExport of exportDecl.getNamedExports()) {
            const internalName = namedExport.getName();
            const partName = namedExport.getAliasNode()?.getText() ?? internalName;
            nameMap[internalName] = `${publicName}.${partName}`;
        }
    }

    return nameMap;
}

/**
 * Find common component prefix from namespace list.
 * Fallback heuristic when barrel files are absent.
 */
function findComponentPrefix(namespaces: ModuleDeclaration[]): string | null {
    const nsNames = namespaces.map((ns) => ns.getName());
    if (nsNames.length < 2) return null;

    // Extract prefix from shortest *Root namespace
    const rootNames = nsNames.filter((n) => n.endsWith('Root'));
    if (rootNames.length > 0) {
        rootNames.sort((a, b) => a.length - b.length);
        return rootNames[0].slice(0, -'Root'.length);
    }

    // Common prefix (for cases without Root)
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
    const allValidBoundary = sorted.every(
        (name) =>
            name.length === prefix.length ||
            (name.length > prefix.length &&
                name[prefix.length] >= 'A' &&
                name[prefix.length] <= 'Z'),
    );

    return allValidBoundary ? prefix : null;
}

/**
 * Convert internal namespace name to public vapor-ui path.
 */
function formatVaporTypePath(
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
    return `${nsName}.${typeName}`;
}

// ============================================================
// Namespace type alias collection
// ============================================================

/**
 * Collect exported type aliases from vapor-ui namespaces and add to base-ui type map.
 *
 * Scans vapor-ui's own namespace declarations (e.g. `namespace CollapsibleRoot`)
 * for type aliases that reference @base-ui types. Uses barrelNameMap for accurate
 * public path computation, falling back to prefix heuristic when barrel files are absent.
 */
function collectNamespaceTypeAliases(
    sourceFile: SourceFile,
    map: BaseUiTypeMap,
    barrelNameMap: Record<string, string>,
): void {
    const namespaces = sourceFile
        .getDescendantsOfKind(SyntaxKind.ModuleDeclaration)
        .filter((mod) => mod.isExported());

    const componentPrefix =
        Object.keys(barrelNameMap).length === 0 ? findComponentPrefix(namespaces) : null;

    for (const ns of namespaces) {
        const nsName = ns.getName();
        const typeAliases = ns.getTypeAliases().filter((ta) => ta.isExported());

        for (const typeAlias of typeAliases) {
            const aliasName = typeAlias.getName();
            const aliasType = typeAlias.getType();

            const normalizedPath = getBaseUiQualifiedPath(aliasType);
            const isBaseUiAlias = !normalizedPath && isBaseUiTypeAlias(typeAlias);

            if (normalizedPath || isBaseUiAlias) {
                const publicNsPath = barrelNameMap[nsName];
                const vaporPath = publicNsPath
                    ? `${publicNsPath}.${aliasName}`
                    : formatVaporTypePath(nsName, aliasName, componentPrefix);

                if (normalizedPath) {
                    map[normalizedPath] = { type: aliasType, vaporPath };
                }

                // Fallback key: namespace.alias format
                map[`${nsName}.${aliasName}`] = { type: aliasType, vaporPath };

                // Flat base-ui symbol name (e.g. CollapsibleRootChangeEventDetails)
                const flatName =
                    aliasType.getSymbol()?.getName() ?? aliasType.getAliasSymbol()?.getName();
                if (flatName && flatName !== aliasName && !map[flatName]) {
                    map[flatName] = { type: aliasType, vaporPath };
                }
            }
        }
    }
}

// ============================================================
// Public API
// ============================================================

// File path based cache
interface CacheEntry {
    map: BaseUiTypeMap;
    lastModifiedTime: number;
}

const baseUiTypeMapCache = new Map<string, CacheEntry>();

/**
 * Build type map from base-ui imports in source file.
 *
 * Scans vapor-ui's namespace type aliases that reference @base-ui types,
 * mapping them to public vapor-ui paths using barrel file resolution.
 */
export function buildBaseUiTypeMap(sourceFile: SourceFile): BaseUiTypeMap {
    const filePath = sourceFile.getFilePath();
    const lastModifiedTime = fs.statSync(filePath).mtimeMs;
    const cached = baseUiTypeMapCache.get(filePath);
    if (cached && cached.lastModifiedTime === lastModifiedTime) return cached.map;

    const map: BaseUiTypeMap = {};

    const barrelNameMap = buildBarrelNameMap(sourceFile);
    collectNamespaceTypeAliases(sourceFile, map, barrelNameMap);

    baseUiTypeMapCache.set(filePath, { map, lastModifiedTime });
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
