/**
 * Props extraction parser module
 *
 * Parser layer extracts ParsedComponent[] from a source file.
 * Legacy extractProps() remains for backward compatibility.
 */
import type { ModuleDeclaration, Node, SourceFile, Symbol } from 'ts-morph';

import type { PropsInfoJson } from '~/application/dto/component-json';
import { componentModelToJson } from '~/application/mappers/component-model-to-json.mapper';
import type { BaseUiTypeMap, ExtractOptions } from '~/core/parser/types';
import type { ComponentModel } from '~/domain/models/component';
import type { ParsedComponent, ParsedProp } from '~/domain/models/parsed';
import { parsedComponentToModel } from '~/domain/services/build-component-model';

import { getComponentDescription } from './component/metadata-parser';
import { findExportedInterfaceProps, getExportedNamespaces } from './component/namespace-parser';
import { getDefaultValuesForNamespace } from './defaults/variant-parser';
import { getPropDescription } from './props/description';
import { shouldIncludeSymbol } from './props/filter';
import { buildBaseUiTypeMap } from './type/base-ui-mapper';
import { cleanType } from './type/cleaner';
import { getSymbolSourcePath } from './type/declaration-source';
import { resolveType } from './type/resolver';

function extractParsedProp(
    symbol: Symbol,
    declNode: Node,
    baseUiMap: BaseUiTypeMap,
    defaultValues: Record<string, string>,
    verbose?: boolean,
): ParsedProp {
    const name = symbol.getName();
    const typeResult = cleanType(
        resolveType(symbol.getTypeAtLocation(declNode), baseUiMap, declNode, verbose),
    );

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

function extractParsedComponent(
    sourceFile: SourceFile,
    namespace: ModuleDeclaration,
    baseUiMap: BaseUiTypeMap,
    options: ExtractOptions,
    includeSet: Set<string>,
): ParsedComponent | null {
    const namespaceName = namespace.getName();

    const exportedInterfaceProps = findExportedInterfaceProps(namespace);
    if (!exportedInterfaceProps) return null;

    const allSymbols = exportedInterfaceProps.getType().getProperties();
    const declaredPropNames = new Set(allSymbols.map((symbol) => symbol.getName()));

    const defaultValues = getDefaultValuesForNamespace(
        sourceFile,
        namespaceName,
        declaredPropNames,
    );

    const filteredSymbols = allSymbols.filter((symbol) =>
        shouldIncludeSymbol(symbol, options, includeSet),
    );

    if (options.verbose) {
        console.error(
            `[verbose] ${namespaceName}: ${allSymbols.length} symbols → ${filteredSymbols.length} after filtering`,
        );
    }

    const props: ParsedProp[] = filteredSymbols.map((symbol) => {
        const declNode = symbol.getDeclarations()[0] ?? exportedInterfaceProps;
        return extractParsedProp(symbol, declNode, baseUiMap, defaultValues, options.verbose);
    });

    return {
        name: namespaceName,
        description: getComponentDescription(sourceFile, namespaceName) ?? undefined,
        props,
    };
}

export function parseSourceFile(
    sourceFile: SourceFile,
    options: ExtractOptions = {},
): ParsedComponent[] {
    const baseUiMap = buildBaseUiTypeMap(sourceFile);
    const namespaces = getExportedNamespaces(sourceFile);
    const parsedComponents: ParsedComponent[] = [];
    const includeSet = new Set(options.include ?? []);

    if (options.verbose) {
        console.error(
            `[verbose] Found ${namespaces.length} namespaces in ${sourceFile.getFilePath()}`,
        );
    }

    for (const namespace of namespaces) {
        try {
            const parsed = extractParsedComponent(
                sourceFile,
                namespace,
                baseUiMap,
                options,
                includeSet,
            );
            if (parsed) parsedComponents.push(parsed);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn(
                `[docs-extractor] Failed to extract props for ${namespace.getName()}: ${message}`,
            );
        }
    }

    return parsedComponents;
}

export interface ExtractResult {
    parsed: ParsedComponent[];
    models: ComponentModel[];
    props: PropsInfoJson[];
}

export function extractProps(sourceFile: SourceFile, options: ExtractOptions = {}): ExtractResult {
    const parsed = parseSourceFile(sourceFile, options);
    const models = parsed.map(parsedComponentToModel);
    const props = models.map(componentModelToJson);
    return { parsed, models, props };
}

export function extractPropsLegacy(
    sourceFile: SourceFile,
    options: ExtractOptions = {},
): { props: PropsInfoJson[] } {
    return { props: extractProps(sourceFile, options).props };
}
