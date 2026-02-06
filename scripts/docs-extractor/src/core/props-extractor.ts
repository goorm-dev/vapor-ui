import { type ModuleDeclaration, type SourceFile, type Symbol, SyntaxKind, ts } from 'ts-morph';

import type { ExtractDiagnostic, FilePropsResult, Property, PropsInfo } from '~/types/props';

import { buildBaseUiTypeMap, findComponentPrefix } from './base-ui-type-resolver';
import { getSymbolSourcePath, isSymbolFromExternalSource } from './declaration-source';
import { getDefaultVariantsForNamespace } from './default-variants';
import { isHtmlAttribute } from './html-attributes';
import {
    type SprinklesMeta,
    getSprinklesDisplayType,
    isSprinklesProp as isSprinklesPropFromMeta,
} from './sprinkles-analyzer';
import { cleanType } from './type-cleaner';
import { resolveType } from './type-resolver';

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

    return jsDocs[0].getDescription().trim() || undefined;
}

function getDefaultElement(sourceFile: SourceFile, namespaceName: string): string | undefined {
    const variableStatement = findComponentVariableStatement(sourceFile, namespaceName);
    if (!variableStatement) return undefined;

    const text = variableStatement.getText();
    const match = text.match(/render:\s*render\s*\|\|\s*<(\w+)/);
    return match?.[1];
}

function getExportedNamespaces(sourceFile: SourceFile) {
    return sourceFile
        .getDescendantsOfKind(SyntaxKind.ModuleDeclaration)
        .filter((module) => module.isExported());
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

function getJsDocDescription(symbol: Symbol): string | undefined {
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
    return filePath.includes('sprinkles.css');
}

function shouldIncludeSymbol(
    symbol: Symbol,
    options: ExtractOptions,
    includeSet: Set<string>,
): boolean {
    const name = symbol.getName();

    // include 옵션에 있으면 항상 포함
    if (includeSet.has(name)) return true;

    // includeHtmlWhitelist에 있으면 다른 필터를 무시하고 포함
    if (options.includeHtmlWhitelist?.has(name)) return true;

    // filterExternal: React/DOM/외부 라이브러리 타입 제외 (선언 위치 기반)
    if (options.filterExternal && isSymbolFromExternalSource(symbol)) return false;

    // filterSprinkles: sprinkles.css 제외
    if (options.filterSprinkles && isSprinklesProp(symbol)) return false;

    // filterHtml: HTML 네이티브 속성 제외
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
    // values가 있으면 사용, 없으면 type을 배열로
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

    // base-ui 타입 맵 빌드
    const baseUiMap = buildBaseUiTypeMap(sourceFile);

    const namespaces = getExportedNamespaces(sourceFile);

    for (const namespace of namespaces) {
        const namespaceName = namespace.getName();
        const exportedInterfaceProps = findExportedInterfaceProps(namespace);

        if (!exportedInterfaceProps) continue;

        const description = getComponentDescription(sourceFile, namespaceName);
        const propsType = exportedInterfaceProps.getType();
        const allSymbols = propsType.getProperties();

        // Props에 정의된 property 이름 목록 (destructuring defaults의 false positive 방지)
        const validPropNames = new Set(allSymbols.map((s) => s.getName()));

        // namespace별로 defaultVariants 추출 (compound component 지원)
        // recipe defaults + destructuring defaults 모두 수집
        const defaultVariants = getDefaultVariantsForNamespace(sourceFile, namespaceName, validPropNames);
        const includeSet = new Set(options.include ?? []);

        const filteredSymbols = allSymbols.filter((symbol) =>
            shouldIncludeSymbol(symbol, options, includeSet),
        );

        const propsWithSource: InternalProperty[] = filteredSymbols.map((symbol) => {
            const name = symbol.getName();
            const declNode = symbol.getDeclarations()[0] ?? exportedInterfaceProps;

            // sprinkles prop인 경우 displayTypeName 사용
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

            const defaultValue = defaultVariants[name] ?? getJsDocDefault(symbol);

            const source = getPropSource(symbol);
            const required = !symbol.isOptional();

            return {
                name,
                type: typeArray,
                required,
                description: getJsDocDescription(symbol),
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

    return { props, ...(diagnostics.length > 0 && { diagnostics }), ...(hierarchy && { hierarchy }) };
}

/**
 * 추출 결과에서 진단 정보를 수집합니다.
 */
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
 * Compound component의 namespace를 계층적으로 그룹핑합니다.
 * Root namespace를 부모로 하고 나머지를 subComponents로 묶습니다.
 */
function buildHierarchy(
    props: PropsInfo[],
    namespaces: ReturnType<typeof getExportedNamespaces>,
): PropsInfo[] | undefined {
    if (props.length <= 1) return undefined;

    const componentPrefix = findComponentPrefix(namespaces);
    if (!componentPrefix) return undefined;

    // Root를 찾아서 나머지를 sub로 분류
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
