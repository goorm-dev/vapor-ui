import type {
    InterfaceDeclaration,
    ModuleDeclaration,
    Node,
    SourceFile,
    Symbol as TsSymbol,
    TypeAliasDeclaration,
} from 'ts-morph';
import { ModuleDeclarationKind, ts } from 'ts-morph';

import { cleanType } from '~/cleaner';
import { getSymbolSourcePath } from '~/declaration-source';
import { getDefaultValuesForNamespace } from '~/extract-defaults';
import { shouldIncludeSymbol } from '~/filter';
import type { ComponentModel } from '~/models/component';
import type { BaseUiTypeMap, ParseOptions } from '~/models/extract';
import type { PropsInfoJson } from '~/models/json';
import type { ParsedComponent, ParsedProp } from '~/models/parsed';
import { resolveType } from '~/resolve';
import { buildBaseUiTypeMap } from '~/resolve/base-ui-mapper';
import { componentModelToJson, parsedComponentToModel } from '~/transform';

export type PropsDeclaration = InterfaceDeclaration | TypeAliasDeclaration;

function findComponentVariableStatement(sourceFile: SourceFile, namespaceName: string) {
    return sourceFile
        .getVariableStatements()
        .find((statement) =>
            statement
                .getDeclarations()
                .some((declaration) => declaration.getName() === namespaceName),
        );
}

export function getComponentDescription(
    sourceFile: SourceFile,
    namespaceName: string,
): string | undefined {
    const variableStatement = findComponentVariableStatement(sourceFile, namespaceName);
    if (!variableStatement) return undefined;

    const jsDocs = variableStatement.getJsDocs();
    if (jsDocs.length === 0) return undefined;

    return jsDocs.at(-1)?.getDescription().trim() || undefined;
}

export function getExportedNamespaces(sourceFile: SourceFile): ModuleDeclaration[] {
    return sourceFile
        .getModules()
        .filter(
            (moduleDecl) =>
                moduleDecl.getDeclarationKind() === ModuleDeclarationKind.Namespace &&
                moduleDecl.isExported(),
        );
}

export function findExportedInterfaceProps(
    namespace: ModuleDeclaration,
): PropsDeclaration | undefined {
    const interfaceProps = namespace
        .getInterfaces()
        .find(
            (exportInterface) =>
                exportInterface.getName() === 'Props' && exportInterface.isExported(),
        );

    if (interfaceProps) return interfaceProps;

    return namespace
        .getTypeAliases()
        .find((typeAlias) => typeAlias.getName() === 'Props' && typeAlias.isExported());
}

export function getPropDescription(symbol: TsSymbol): string | undefined {
    const docs = symbol.compilerSymbol.getDocumentationComment(undefined);
    if (docs.length === 0) return undefined;
    return ts.displayPartsToString(docs) || undefined;
}

function extractParsedProp(
    symbol: TsSymbol,
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
    options: ParseOptions,
    includeSet: Set<string>,
    htmlWhitelist: Set<string>,
): ParsedComponent | null {
    const namespaceName = namespace.getName();
    const exportedProps = findExportedInterfaceProps(namespace);
    if (!exportedProps) return null;

    const allSymbols = exportedProps.getType().getProperties();
    const declaredPropNames = new Set(allSymbols.map((symbol) => symbol.getName()));
    const defaultValues = getDefaultValuesForNamespace(
        sourceFile,
        namespaceName,
        declaredPropNames,
    );

    const filteredSymbols = allSymbols.filter((symbol) =>
        shouldIncludeSymbol(symbol, options, includeSet, htmlWhitelist),
    );

    if (options.verbose) {
        console.error(
            `[verbose] ${namespaceName}: ${allSymbols.length} symbols -> ${filteredSymbols.length} after filtering`,
        );
    }

    const props = filteredSymbols.map((symbol) => {
        const declNode = symbol.getDeclarations()[0] ?? exportedProps;
        return extractParsedProp(symbol, declNode, baseUiMap, defaultValues, options.verbose);
    });

    return {
        name: namespaceName,
        description: getComponentDescription(sourceFile, namespaceName) ?? undefined,
        props,
    };
}

const DEFAULT_PARSE_OPTIONS: ParseOptions = {
    filterExternal: false,
    filterHtml: true,
    filterSprinkles: true,
};

export function parseSourceFile(
    sourceFile: SourceFile,
    options: ParseOptions = DEFAULT_PARSE_OPTIONS,
): ParsedComponent[] {
    const baseUiMap = buildBaseUiTypeMap(sourceFile);
    const namespaces = getExportedNamespaces(sourceFile);
    const parsedComponents: ParsedComponent[] = [];
    const includeSet = new Set(options.include ?? []);
    const htmlWhitelist = new Set(options.includeHtml ?? []);

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
                htmlWhitelist,
            );
            if (parsed) {
                parsedComponents.push(parsed);
            }
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

export function extractProps(
    sourceFile: SourceFile,
    options: ParseOptions = DEFAULT_PARSE_OPTIONS,
): ExtractResult {
    const parsed = parseSourceFile(sourceFile, options);
    const models = parsed.map(parsedComponentToModel);
    const props = models.map(componentModelToJson);
    return { parsed, models, props };
}
