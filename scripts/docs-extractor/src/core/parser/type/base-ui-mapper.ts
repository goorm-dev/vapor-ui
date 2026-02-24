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
import path from 'node:path';
import { type SourceFile, SyntaxKind, type Type, type TypeAliasDeclaration } from 'ts-morph';

import type { BaseUiTypeMap } from '~/core/parser/types';

/**
 * Extract base-ui qualified path from Type object using AST.
 */
function getBaseUiQualifiedPath(type: Type): string | null {
    for (const symbol of [type.getSymbol(), type.getAliasSymbol()]) {
        if (!symbol) continue;

        const hasBaseUiDeclaration = symbol
            .getDeclarations()
            .some((decl) => decl.getSourceFile().getFilePath().includes('@base-ui'));
        if (!hasBaseUiDeclaration) continue;

        const fqn = symbol.getFullyQualifiedName();

        // FQN format: "module/path".Namespace.Type
        if (!fqn.startsWith('"')) continue;

        const closingQuote = fqn.indexOf('"', 1);
        if (closingQuote === -1) continue;

        // "module/path".Namespace.Type → Namespace.Type
        if (closingQuote + 2 > fqn.length) continue;
        return fqn.substring(closingQuote + 2);
    }

    return null;
}

function isDeclaredInBaseUi(type: Type): boolean {
    const symbol = type.getSymbol() ?? type.getAliasSymbol();
    if (symbol) {
        for (const decl of symbol.getDeclarations()) {
            if (decl.getSourceFile().getFilePath().includes('@base-ui')) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Check if type alias references @base-ui package type.
 */
function isBaseUiTypeAlias(typeAlias: TypeAliasDeclaration): boolean {
    const aliasType = typeAlias.getType();

    return isDeclaredInBaseUi(aliasType);
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

// ============================================================
// Namespace type alias collection
// ============================================================

/**
 * Collect exported type aliases from vapor-ui namespaces and add to base-ui type map.
 *
 * Scans vapor-ui's own namespace declarations (e.g. `namespace CollapsibleRoot`)
 * for type aliases that reference @base-ui types. Uses barrelNameMap as the
 * authoritative source of public name mapping.
 */
function collectNamespaceTypeAliases(
    sourceFile: SourceFile,
    map: BaseUiTypeMap,
    barrelNameMap: Record<string, string>,
): void {
    const namespaces = sourceFile
        .getDescendantsOfKind(SyntaxKind.ModuleDeclaration)
        .filter((mod) => mod.isExported());

    for (const ns of namespaces) {
        const nsName = ns.getName();
        const publicNsPath = barrelNameMap[nsName];
        if (!publicNsPath) continue;

        const typeAliases = ns.getTypeAliases().filter((ta) => ta.isExported());

        for (const typeAlias of typeAliases) {
            const aliasName = typeAlias.getName();
            const aliasType = typeAlias.getType();

            const normalizedPath = getBaseUiQualifiedPath(aliasType);
            const isBaseUiAlias = !normalizedPath && isBaseUiTypeAlias(typeAlias);

            if (normalizedPath || isBaseUiAlias) {
                const vaporPath = `${publicNsPath}.${aliasName}`;

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

/**
 * Build type map from base-ui imports in source file.
 *
 * Scans vapor-ui's namespace type aliases that reference @base-ui types,
 * mapping them to public vapor-ui paths using barrel file resolution.
 */
export function buildBaseUiTypeMap(sourceFile: SourceFile): BaseUiTypeMap {
    const map: BaseUiTypeMap = {};

    const barrelNameMap = buildBarrelNameMap(sourceFile);
    collectNamespaceTypeAliases(sourceFile, map, barrelNameMap);

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
