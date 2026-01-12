import { type SourceFile, type Symbol, SyntaxKind, ts } from 'ts-morph';

import type { FilePropsResult, Property, PropsInfo } from '~/types/props';

import { getDefaultVariantsForComponent } from './default-variants';
import { isHtmlAttribute } from './html-attributes';
import { cleanType } from './type-cleaner';
import { resolveType } from './type-resolver';

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

function getSymbolSourcePath(symbol: Symbol): string | undefined {
    const declarations = symbol.getDeclarations();
    if (!declarations.length) return undefined;
    return declarations[0].getSourceFile().getFilePath();
}

function isProjectProp(symbol: Symbol): boolean {
    const filePath = getSymbolSourcePath(symbol);
    if (!filePath) return true;

    // base-ui는 포함
    if (filePath.includes('@base-ui-components')) return true;

    return !filePath.includes('node_modules');
}

function isSprinklesProp(symbol: Symbol): boolean {
    const filePath = getSymbolSourcePath(symbol);
    if (!filePath) return false;
    return filePath.includes('sprinkles.css');
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

interface PropertyWithSource extends Property {
    _source: PropSource;
}

function sortProps(props: PropertyWithSource[]): Property[] {
    return props
        .sort((a, b) => {
            // 소스 카테고리 순서로 먼저 정렬
            const sourceOrder = SOURCE_ORDER[a._source] - SOURCE_ORDER[b._source];
            if (sourceOrder !== 0) return sourceOrder;

            // 같은 카테고리 내에서는 알파벳순
            return a.name.localeCompare(b.name);
        })
        .map(({ _source: _, ...prop }) => prop);
}

export function extractProps(
    sourceFile: SourceFile,
    options: ExtractOptions = {},
): FilePropsResult {
    const props: PropsInfo[] = [];
    const filePath = sourceFile.getFilePath();
    const defaultVariants = getDefaultVariantsForComponent(filePath);

    const namespaces = sourceFile
        .getDescendantsOfKind(SyntaxKind.ModuleDeclaration)
        .filter((mod) => mod.isExported());

    for (const ns of namespaces) {
        const nsName = ns.getName();
        const propsInterface = ns
            .getInterfaces()
            .find((i) => i.getName() === 'Props' && i.isExported());

        if (!propsInterface) continue;

        // Props 인터페이스의 JSDoc description 추출
        const jsDocs = propsInterface.getJsDocs();
        const description = jsDocs.length > 0 ? jsDocs[0].getDescription().trim() : undefined;

        const propsType = propsInterface.getType();
        const allSymbols = propsType.getProperties();
        const includeSet = new Set(options.include ?? []);

        const filteredSymbols = allSymbols.filter((symbol) => {
            const name = symbol.getName();

            // include 옵션에 있으면 항상 포함
            if (includeSet.has(name)) return true;

            // includeHtmlWhitelist에 있으면 다른 필터를 무시하고 포함
            if (options.includeHtmlWhitelist?.has(name)) return true;

            // filterExternal: node_modules 제외
            if (options.filterExternal && !isProjectProp(symbol)) return false;

            // filterSprinkles: sprinkles.css 제외
            if (options.filterSprinkles && isSprinklesProp(symbol)) return false;

            // filterHtml: HTML 네이티브 속성 제외
            if (options.filterHtml !== false && isHtmlAttribute(name)) return false;

            return true;
        });

        const propsWithSource: PropertyWithSource[] = filteredSymbols.map((symbol) => {
            const name = symbol.getName();
            const typeResult = cleanType(resolveType(symbol.getTypeAtLocation(propsInterface)));
            const defaultValue = defaultVariants[name];

            return {
                name,
                type: typeResult.type,
                optional: symbol.isOptional(),
                description: getJsDocDescription(symbol),
                defaultValue,
                values: typeResult.values,
                _source: getPropSource(symbol),
            };
        });

        const sortedProps = sortProps(propsWithSource);

        props.push({
            name: `${nsName}.Props`,
            description: description || undefined,
            props: sortedProps,
        });
    }

    return { props };
}
