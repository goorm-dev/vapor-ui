import { type SourceFile, type Symbol, SyntaxKind, ts } from 'ts-morph';

import type { ExtendedType, FilePropsResult, Property, PropsInfo } from '~/types/props';
import { cleanType } from './type-cleaner';

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
    const filePath = sourceFile.getFilePath();
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

        const localTypeAliases = new Map(
            ns.getTypeAliases().map((ta) => [ta.getName(), ta.getTypeNode()?.getText() ?? '']),
        );

        const extendsTypes: ExtendedType[] = propsInterface.getExtends().map((ext) => {
            const name = ext.getExpression().getText();
            const resolved = localTypeAliases.get(name) ?? name;
            return { name, resolved };
        });

        const properties: Property[] = propsInterface.getProperties().map((prop) => ({
            name: prop.getName(),
            type: prop.getTypeNode()?.getText() ?? 'unknown',
            optional: prop.hasQuestionToken(),
        }));

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

        const resolvedProperties: Property[] = filteredSymbols.map((symbol) => ({
            name: symbol.getName(),
            type: cleanType(symbol.getTypeAtLocation(propsInterface).getText()),
            optional: symbol.isOptional(),
            description: getJsDocDescription(symbol),
        }));

        const associatedTypes = ns
            .getTypeAliases()
            .filter((ta) => ta.isExported())
            .map((ta) => ta.getName());

        props.push({
            name: `${nsName}.Props`,
            extends: extendsTypes,
            properties,
            resolvedProperties,
            associatedTypes,
        });
    }

    return { filePath, props };
}
