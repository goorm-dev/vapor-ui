import type {
    ModuleDeclaration,
    Node,
    SourceFile,
    Symbol as TsSymbol,
    TypeAliasDeclaration,
} from 'ts-morph';
import { ModuleDeclarationKind, ts } from 'ts-morph';

import type { ParseConfig } from '~/models/config';
import type { BaseUiTypeMap, ParsedComponent, ParsedProp } from '~/models/pipeline';
import { resolveType } from '~/resolve';
import { buildBaseUiTypeMap } from '~/resolve/base-ui-mapper';
import { cleanType } from '~/utils/cleaner';
import { classifyPropSource } from '~/utils/declaration-source';
import { getDefaultValuesForNamespace } from '~/utils/extract-defaults';

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
): TypeAliasDeclaration | undefined {
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
        source: classifyPropSource(symbol),
        description: getPropDescription(symbol),
        defaultValue: defaultValues[name],
    };
}

function extractParsedComponent(
    sourceFile: SourceFile,
    namespace: ModuleDeclaration,
    baseUiMap: BaseUiTypeMap,
    options: ParseConfig,
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

    if (options.verbose) {
        console.error(`[verbose] ${namespaceName}: ${allSymbols.length} symbols`);
    }

    const props = allSymbols.map((symbol) => {
        const declNode = symbol.getDeclarations()[0] ?? exportedProps;
        return extractParsedProp(symbol, declNode, baseUiMap, defaultValues, options.verbose);
    });

    return {
        name: namespaceName,
        description: getComponentDescription(sourceFile, namespaceName) ?? undefined,
        props,
    };
}

const DEFAULT_PARSE_CONFIG: ParseConfig = {
    verbose: undefined,
};

export function parseSourceFile(
    sourceFile: SourceFile,
    options: ParseConfig = DEFAULT_PARSE_CONFIG,
): ParsedComponent[] {
    const baseUiMap = buildBaseUiTypeMap(sourceFile);
    const namespaces = getExportedNamespaces(sourceFile);
    const parsedComponents: ParsedComponent[] = [];

    if (options.verbose) {
        console.error(
            `[verbose] Found ${namespaces.length} namespaces in ${sourceFile.getFilePath()}`,
        );
    }

    for (const namespace of namespaces) {
        try {
            const parsed = extractParsedComponent(sourceFile, namespace, baseUiMap, options);
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
