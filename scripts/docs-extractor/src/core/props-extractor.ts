import {
    type ModuleDeclaration,
    ModuleDeclarationKind,
    type SourceFile,
    type Symbol,
    SyntaxKind,
    ts,
} from 'ts-morph';

import type { ExtractDiagnostic, FilePropsResult, Property, PropsInfo } from '~/types/props';

import { buildBaseUiTypeMap, findComponentPrefix } from './base-ui-type-resolver';
import { getSymbolSourcePath, isSymbolFromExternalSource } from './declaration-source';
import { getDefaultValuesForNamespace } from './default-variants';
import { isHtmlAttribute } from './html-attributes';
import {
    type SprinklesMeta,
    getSprinklesDisplayType,
    isSprinklesProp as isSprinklesPropFromMeta,
} from './sprinkles-analyzer';
import { cleanType } from './type-cleaner';
import { resolveType } from './type-resolver';

/** Sprinkles CSS file pattern */
const SPRINKLES_FILE_PATTERN = 'sprinkles.css';

function findComponentVariableStatement(sourceFile: SourceFile, namespaceName: string) {
    return sourceFile
        .getVariableStatements()
        .find((statement) =>
            statement.getDeclarations().some((d) => d.getName() === namespaceName),
        );
}

function getComponentDescription(
    sourceFile: SourceFile,
    namespaceName: string,
): string | undefined {
    const variableStatement = findComponentVariableStatement(sourceFile, namespaceName);
    if (!variableStatement) return undefined;

    const jsDocs = variableStatement.getJsDocs();
    if (jsDocs.length === 0) return undefined;

    // Use the last JSDoc comment (closest to the declaration)
    return jsDocs.at(-1)!.getDescription().trim() || undefined;
}

function getDefaultElement(sourceFile: SourceFile, namespaceName: string): string | undefined {
    const variableStatement = findComponentVariableStatement(sourceFile, namespaceName);
    if (!variableStatement) return undefined;

    // Find the 'render' property assignment in the component definition
    const renderProp = variableStatement
        .getDescendantsOfKind(SyntaxKind.PropertyAssignment)
        .find((prop) => prop.getName() === 'render');

    if (!renderProp) return undefined;

    // Extract the fallback JSX element from: render || <element />
    const selfClosing = renderProp.getFirstDescendantByKind(SyntaxKind.JsxSelfClosingElement);
    if (selfClosing) {
        return selfClosing.getTagNameNode().getText();
    }

    const jsxElement = renderProp.getFirstDescendantByKind(SyntaxKind.JsxElement);
    if (jsxElement) {
        return jsxElement.getOpeningElement().getTagNameNode().getText();
    }

    return undefined;
}

function getExportedNamespaces(sourceFile: SourceFile) {
    return sourceFile
        .getModules()
        .filter(
            (module) =>
                module.getDeclarationKind() === ModuleDeclarationKind.Namespace &&
                module.isExported,
        );
}

function findExportedInterfaceProps(namespace: ModuleDeclaration) {
    return namespace
        .getInterfaces()
        .find(
            (exportInterface) =>
                exportInterface.getName() === 'Props' && exportInterface.isExported(),
        );
}

export interface ExtractOptions {
    filterExternal?: boolean;
    filterSprinkles?: boolean;
    filterHtml?: boolean;
    includeHtmlWhitelist?: Set<string>;
    include?: string[];
    sprinklesMeta?: SprinklesMeta;
}

function getPropDescription(symbol: Symbol): string | undefined {
    const docs = symbol.compilerSymbol.getDocumentationComment(undefined);
    if (docs.length === 0) return undefined;
    return ts.displayPartsToString(docs) || undefined;
}

function getJsDocDefault(symbol: Symbol): string | undefined {
    const tags = symbol.compilerSymbol.getJsDocTags();
    const defaultTag = tags.find((tag) => tag.name === 'default');
    if (!defaultTag?.text) return undefined;
    return ts.displayPartsToString(defaultTag.text) || undefined;
}

function isSprinklesProp(symbol: Symbol): boolean {
    const filePath = getSymbolSourcePath(symbol);
    if (!filePath) return false;
    return filePath.includes(SPRINKLES_FILE_PATTERN);
}

function shouldIncludeSymbol(
    symbol: Symbol,
    options: ExtractOptions,
    includeSet: Set<string>,
): boolean {
    const name = symbol.getName();

    if (includeSet.has(name)) return true;

    if (options.includeHtmlWhitelist?.has(name)) return true;

    // Exclude React/DOM/external library types (based on declaration source)
    if (options.filterExternal && isSymbolFromExternalSource(symbol)) return false;

    if (options.filterSprinkles && isSprinklesProp(symbol)) return false;

    if (options.filterHtml !== false && isHtmlAttribute(name)) return false;

    return true;
}

type PropSource = 'base-ui' | 'custom' | 'variants';

function getPropSource(symbol: Symbol): PropSource {
    const filePath = getSymbolSourcePath(symbol);
    if (!filePath) return 'custom';

    if (filePath.includes('@base-ui')) return 'base-ui';
    if (filePath.endsWith('.css.ts')) return 'variants';

    return 'custom';
}

type PropCategory = 'required' | 'variants' | 'state' | 'custom' | 'base-ui' | 'composition';

const CATEGORY_ORDER: Record<PropCategory, number> = {
    required: 0,
    variants: 1,
    state: 2,
    custom: 3,
    'base-ui': 4,
    composition: 5,
};

const STATE_PROP_PATTERNS = [
    /^value$/,
    /^defaultValue$/,
    /^onChange$/,
    /^on[A-Z].*Change$/,
    /^(open|checked|selected|expanded|pressed|active)$/,
    /^default(Open|Checked|Selected|Expanded|Pressed|Active)$/,
];

const COMPOSITION_PROPS = new Set(['asChild', 'render']);

function isStateProp(name: string): boolean {
    return STATE_PROP_PATTERNS.some((pattern) => pattern.test(name));
}

function isCompositionProp(name: string): boolean {
    return COMPOSITION_PROPS.has(name);
}

function getPropCategory(name: string, required: boolean, source: PropSource): PropCategory {
    if (required) return 'required';
    if (isCompositionProp(name)) return 'composition';
    if (source === 'variants') return 'variants';
    if (isStateProp(name)) return 'state';
    if (source === 'base-ui') return 'base-ui';
    return 'custom';
}

interface InternalProperty {
    name: string;
    type: string[];
    required: boolean;
    description?: string;
    defaultValue?: string;
    _source: PropSource;
    _category: PropCategory;
}

function sortProps(props: InternalProperty[]): Property[] {
    return props
        .sort((a, b) => {
            const categoryOrder = CATEGORY_ORDER[a._category] - CATEGORY_ORDER[b._category];
            if (categoryOrder !== 0) return categoryOrder;
            return a.name.localeCompare(b.name);
        })
        .map(({ _source: _, _category: __, ...rest }) => rest);
}

function toTypeArray(typeResult: { type: string; values?: string[] }): string[] {
    // Use values if available, otherwise wrap type in an array
    if (typeResult.values && typeResult.values.length > 0) {
        return typeResult.values;
    }
    return [typeResult.type];
}

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
