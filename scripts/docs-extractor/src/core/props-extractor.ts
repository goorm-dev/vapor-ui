/**
 * Props extraction orchestrator
 *
 * Coordinates component discovery, prop filtering, classification, and type resolution
 * to produce the final extraction result for each component in a source file.
 */
import type { SourceFile } from 'ts-morph';

import type { ExtractDiagnostic, FilePropsResult, PropsInfo } from '~/types/props';

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
import { buildBaseUiTypeMap, cleanType, findComponentPrefix, resolveType } from './types';

export type { ExtractOptions } from './props';

export function extractProps(
    sourceFile: SourceFile,
    options: ExtractOptions = {},
): FilePropsResult {
    const props: PropsInfo[] = [];

    // Build base-ui type map
    const baseUiMap = buildBaseUiTypeMap(sourceFile);

    const namespaces = getExportedNamespaces(sourceFile);

    for (const namespace of namespaces) {
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

        const propsWithSource: InternalProperty[] = filteredSymbols.map((symbol) => {
            const name = symbol.getName();
            const declNode = symbol.getDeclarations()[0] ?? exportedInterfaceProps;

            // Use displayTypeName for sprinkles props
            let typeArray: string[];
            if (options.sprinklesMeta && isSprinklesPropFromMeta(name, options.sprinklesMeta)) {
                const displayType = getSprinklesDisplayType(name, options.sprinklesMeta);
                if (displayType) {
                    typeArray = [displayType];
                } else {
                    const typeResult = cleanType(
                        resolveType(symbol.getTypeAtLocation(declNode), baseUiMap, declNode),
                    );
                    typeArray = toTypeArray(typeResult);
                }
            } else {
                const typeResult = cleanType(
                    resolveType(symbol.getTypeAtLocation(declNode), baseUiMap, declNode),
                );
                typeArray = toTypeArray(typeResult);
            }

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
    }

    const diagnostics = collectDiagnostics(props);
    const hierarchy = buildHierarchy(props, namespaces);

    return {
        props,
        ...(diagnostics.length > 0 && { diagnostics }),
        ...(hierarchy && { hierarchy }),
    };
}

/** Collects diagnostics from the extraction result. */
function collectDiagnostics(props: PropsInfo[]): ExtractDiagnostic[] {
    const diagnostics: ExtractDiagnostic[] = [];

    for (const component of props) {
        if (!component.description) {
            diagnostics.push({
                type: 'missing-description',
                componentName: component.name,
                message: `Component "${component.name}" has no JSDoc description`,
            });
        }
    }

    return diagnostics;
}

/**
 * Groups compound component namespaces into a hierarchy.
 * Uses the Root namespace as the parent and nests the rest as subComponents.
 */
function buildHierarchy(
    props: PropsInfo[],
    namespaces: ReturnType<typeof getExportedNamespaces>,
): PropsInfo[] | undefined {
    if (props.length <= 1) return undefined;

    const componentPrefix = findComponentPrefix(namespaces);
    if (!componentPrefix) return undefined;

    // Find Root and classify the rest as sub-components
    const rootName = `${componentPrefix}Root`;
    const root = props.find((p) => p.name === rootName);
    if (!root) return undefined;

    const subComponents = props
        .filter((p) => p.name !== rootName)
        .map((p) => ({
            ...p,
            parentComponent: componentPrefix,
        }));

    return [
        {
            ...root,
            subComponents,
        },
    ];
}
