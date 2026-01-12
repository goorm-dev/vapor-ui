import { type SourceFile, type Symbol, SyntaxKind, ts } from 'ts-morph';

import type { FilePropsResult, Property, PropsInfo } from '~/types/props';

import { cleanType } from './type-cleaner';
import { resolveType } from './type-resolver';

export interface ExtractOptions {
    filterExternal?: boolean;
    filterSprinkles?: boolean;
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

export function extractProps(
    sourceFile: SourceFile,
    options: ExtractOptions = {},
): FilePropsResult {
    const props: PropsInfo[] = [];

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

            // filterExternal: node_modules 제외
            if (options.filterExternal && !isProjectProp(symbol)) return false;

            // filterSprinkles: sprinkles.css 제외
            if (options.filterSprinkles && isSprinklesProp(symbol)) return false;

            return true;
        });

        const propsArray: Property[] = filteredSymbols.map((symbol) => ({
            name: symbol.getName(),
            type: cleanType(resolveType(symbol.getTypeAtLocation(propsInterface))),
            optional: symbol.isOptional(),
            description: getJsDocDescription(symbol),
        }));

        props.push({
            name: `${nsName}.Props`,
            description: description || undefined,
            props: propsArray,
        });
    }

    return { props };
}
