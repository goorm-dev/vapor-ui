/**
 * Props extraction orchestrator
 *
 * Coordinates component discovery, prop filtering, classification, and type resolution
 * to produce the final extraction result for each component in a source file.
 */
import type { Node, SourceFile, Symbol } from 'ts-morph';

import type { FilePropsResult, PropsInfo } from '~/types/props';

import {
    getDefaultValuesForNamespace,
    getSprinklesDisplayType,
    isSprinklesProp as isSprinklesPropFromMeta,
} from './defaults';
import {
    findExportedInterfaceProps,
    getComponentDescription,
    getDefaultElement,
    getExportedNamespaces,
} from './discovery';
import {
    type ExtractOptions,
    type InternalProperty,
    getJsDocDefault,
    getPropCategory,
    getPropDescription,
    getPropSource,
    shouldIncludeSymbol,
    sortProps,
    toTypeArray,
} from './props';
import { type BaseUiTypeMap, buildBaseUiTypeMap, cleanType, resolveType } from './types';

export type { ExtractOptions } from './props';

function resolvePropertyType(
    symbol: Symbol,
    declNode: Node,
    baseUiMap: BaseUiTypeMap,
    options: ExtractOptions,
): string[] {
    if (options.sprinklesMeta) {
        const name = symbol.getName();
        if (isSprinklesPropFromMeta(name, options.sprinklesMeta)) {
            const displayType = getSprinklesDisplayType(name, options.sprinklesMeta);
            if (displayType) {
                return [displayType];
            }
        }
    }

    const typeResult = cleanType(
        resolveType(symbol.getTypeAtLocation(declNode), baseUiMap, declNode, options.verbose),
    );
    return toTypeArray(typeResult);
}

export function extractProps(
    sourceFile: SourceFile,
    options: ExtractOptions = {},
): FilePropsResult {
    const props: PropsInfo[] = [];

    // Build base-ui type map
    const baseUiMap = buildBaseUiTypeMap(sourceFile);

    const namespaces = getExportedNamespaces(sourceFile);

    if (options.verbose) {
        console.error(
            `[verbose] Found ${namespaces.length} namespaces in ${sourceFile.getFilePath()}`,
        );
    }

    for (const namespace of namespaces) {
        try {
            const namespaceName = namespace.getName();
            const exportedInterfaceProps = findExportedInterfaceProps(namespace);

            if (!exportedInterfaceProps) continue;

            const description = getComponentDescription(sourceFile, namespaceName);
            const allSymbols = exportedInterfaceProps.getType().getProperties();

            // Prop names declared in the Props interface (filters out internal variable defaults)
            const declaredPropNames = new Set(allSymbols.map((symbol) => symbol.getName()));

            // Extract default values per namespace (supports compound components)
            // Collects both recipe defaults and destructuring defaults
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

            const propsWithSource: InternalProperty[] = filteredSymbols.map((symbol) => {
                const name = symbol.getName();
                const declNode = symbol.getDeclarations()[0] ?? exportedInterfaceProps;

                const typeArray = resolvePropertyType(symbol, declNode, baseUiMap, options);

                const defaultValue = defaultValues[name] ?? getJsDocDefault(symbol);

                const source = getPropSource(symbol);
                const required = !symbol.isOptional();

                return {
                    name,
                    type: typeArray,
                    required,
                    description: getPropDescription(symbol),
                    defaultValue,
                    _source: source,
                    _category: getPropCategory(name, required, source),
                };
            });

            const sortedProps = sortProps(propsWithSource);
            const defaultElement = getDefaultElement(sourceFile, namespaceName);

            props.push({
                name: namespaceName,
                displayName: namespaceName,
                description: description || undefined,
                props: sortedProps,
                defaultElement,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn(
                `[docs-extractor] Failed to extract props for ${namespace.getName()}: ${message}`,
            );
            continue;
        }
    }

    return { props };
}
