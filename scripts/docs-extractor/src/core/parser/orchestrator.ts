/**
 * Props extraction orchestrator
 *
 * Coordinates the 3-layer architecture:
 * 1. Parser: AST → RawComponent[]
 * 2. Model: RawComponent[] → ComponentModel[]
 * 3. Serializer: ComponentModel[] → PropsInfoJson[]
 */
import type { Node, SourceFile, Symbol } from 'ts-morph';

import { rawComponentToModel } from '~/core/model/transformer';
import type { ComponentModel } from '~/core/model/types';
import type { BaseUiTypeMap } from '~/core/parser/types';
import type { ExtractOptions } from '~/core/parser/types';
import { componentModelToJson } from '~/core/serializer/to-json';
import type { PropsInfoJson } from '~/core/serializer/types';

import { getComponentDescription } from './component/metadata-parser';
import { findExportedInterfaceProps, getExportedNamespaces } from './component/namespace-parser';
import { getDefaultValuesForNamespace } from './defaults/variant-parser';
import { getPropDescription } from './props/description';
import { shouldIncludeSymbol } from './props/filter';
import { buildBaseUiTypeMap } from './type/base-ui-mapper';
import { cleanType } from './type/cleaner';
import { getSymbolSourcePath } from './type/declaration-source';
import { resolveType } from './type/resolver';
import type { RawComponent, RawProp } from './types';

// ============================================================
// Parser Layer: AST → Raw
// ============================================================

function extractRawProp(
    symbol: Symbol,
    declNode: Node,
    baseUiMap: BaseUiTypeMap,
    defaultValues: Record<string, string>,
    verbose?: boolean,
): RawProp {
    const name = symbol.getName();
    const typeResult = cleanType(
        resolveType(symbol.getTypeAtLocation(declNode), baseUiMap, declNode, verbose),
    );

    // Type array를 문자열로 (Model에서 다시 파싱)
    const typeString =
        typeResult.values && typeResult.values.length > 0
            ? typeResult.values.join(' | ')
            : typeResult.type;

    return {
        name,
        typeString,
        isOptional: symbol.isOptional(),
        description: getPropDescription(symbol),
        defaultValue: defaultValues[name],
        declarationFilePath: getSymbolSourcePath(symbol),
    };
}

function extractRawComponent(
    sourceFile: SourceFile,
    namespaceName: string,
    baseUiMap: BaseUiTypeMap,
    options: ExtractOptions,
): RawComponent | null {
    const namespace = getExportedNamespaces(sourceFile).find(
        (ns) => ns.getName() === namespaceName,
    );
    if (!namespace) return null;

    const exportedInterfaceProps = findExportedInterfaceProps(namespace);
    if (!exportedInterfaceProps) return null;

    const allSymbols = exportedInterfaceProps.getType().getProperties();
    const declaredPropNames = new Set(allSymbols.map((s) => s.getName()));

    const defaultValues = getDefaultValuesForNamespace(
        sourceFile,
        namespaceName,
        declaredPropNames,
    );
    const includeSet = new Set(options.include ?? []);

    const filteredSymbols = allSymbols.filter((symbol) =>
        shouldIncludeSymbol(symbol, options, includeSet),
    );

    if (options.verbose) {
        console.error(
            `[verbose] ${namespaceName}: ${allSymbols.length} symbols → ${filteredSymbols.length} after filtering`,
        );
    }

    const props: RawProp[] = filteredSymbols.map((symbol) => {
        const declNode = symbol.getDeclarations()[0] ?? exportedInterfaceProps;
        return extractRawProp(symbol, declNode, baseUiMap, defaultValues, options.verbose);
    });

    return {
        name: namespaceName,
        description: getComponentDescription(sourceFile, namespaceName) ?? undefined,
        props,
    };
}

function parseFile(sourceFile: SourceFile, options: ExtractOptions): RawComponent[] {
    const baseUiMap = buildBaseUiTypeMap(sourceFile);
    const namespaces = getExportedNamespaces(sourceFile);
    const rawComponents: RawComponent[] = [];

    if (options.verbose) {
        console.error(
            `[verbose] Found ${namespaces.length} namespaces in ${sourceFile.getFilePath()}`,
        );
    }

    for (const namespace of namespaces) {
        try {
            const raw = extractRawComponent(sourceFile, namespace.getName(), baseUiMap, options);
            if (raw) rawComponents.push(raw);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn(
                `[docs-extractor] Failed to extract props for ${namespace.getName()}: ${message}`,
            );
        }
    }

    return rawComponents;
}

// ============================================================
// Public API
// ============================================================

export interface ExtractResult {
    /** Raw parser output */
    raw: RawComponent[];
    /** Domain models */
    models: ComponentModel[];
    /** JSON-ready output */
    props: PropsInfoJson[];
}

/**
 * Extract props from a source file through the 3-layer pipeline
 */
export function extractProps(sourceFile: SourceFile, options: ExtractOptions = {}): ExtractResult {
    // Layer 1: Parser (AST → Raw)
    const raw = parseFile(sourceFile, options);

    // Layer 2: Model (Raw → Domain)
    const models = raw.map(rawComponentToModel);

    // Layer 3: Serializer (Domain → JSON)
    const props = models.map(componentModelToJson);

    return { raw, models, props };
}

/**
 * Legacy compatibility: Returns only the JSON props
 * @deprecated Use extractProps().props instead
 */
export function extractPropsLegacy(
    sourceFile: SourceFile,
    options: ExtractOptions = {},
): { props: PropsInfoJson[] } {
    return { props: extractProps(sourceFile, options).props };
}
