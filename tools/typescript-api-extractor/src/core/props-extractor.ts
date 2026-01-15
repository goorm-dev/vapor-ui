import { type ModuleDeclaration, type SourceFile, type Symbol, SyntaxKind, ts } from 'ts-morph';

import type { FilePropsResult, Property, PropsInfo } from '~/types/props';

import { buildBaseUiTypeMap } from './base-ui-type-resolver';
import { getSymbolSourcePath, isSymbolFromExternalSource } from './declaration-source';
import { getDefaultVariantsForNamespace } from './default-variants';
import { isHtmlAttribute } from './html-attributes';
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

    if (filePath.includes('@base-ui-components')) return 'base-ui';
    if (filePath.endsWith('.css.ts')) return 'variants';

    return 'custom';
}

const SOURCE_ORDER: Record<PropSource, number> = {
    'base-ui': 0,
    custom: 1,
    variants: 2,
};

interface InternalProperty {
    name: string;
    type: string[];
    required: boolean;
    description?: string;
    defaultValue?: string;
    _source: PropSource;
}

function sortProps(props: InternalProperty[]): Property[] {
    return props
        .sort((a, b) => {
            const sourceOrder = SOURCE_ORDER[a._source] - SOURCE_ORDER[b._source];
            if (sourceOrder !== 0) return sourceOrder;
            return a.name.localeCompare(b.name);
        })
        .map(({ _source: _, ...prop }) => prop);
}

function toTypeArray(typeResult: { type: string; values?: string[] }): string[] {
    if (typeResult.values) {
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

        // namespace별로 defaultVariants 추출 (compound component 지원)
        const defaultVariants = getDefaultVariantsForNamespace(sourceFile, namespaceName);

        const description = getComponentDescription(sourceFile, namespaceName);
        const propsType = exportedInterfaceProps.getType();
        const allSymbols = propsType.getProperties();
        const includeSet = new Set(options.include ?? []);

        const filteredSymbols = allSymbols.filter((symbol) =>
            shouldIncludeSymbol(symbol, options, includeSet),
        );

        const propsWithSource: InternalProperty[] = filteredSymbols.map((symbol) => {
            const name = symbol.getName();

            const typeResult = cleanType(
                resolveType(symbol.getTypeAtLocation(symbol.getDeclarations()[0]), baseUiMap),
            );

            const defaultValue = defaultVariants[name] ?? getJsDocDefault(symbol);

            return {
                name,
                type: toTypeArray(typeResult),
                required: !symbol.isOptional(),
                description: getJsDocDescription(symbol),
                defaultValue,
                _source: getPropSource(symbol),
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

    return { props };
}
