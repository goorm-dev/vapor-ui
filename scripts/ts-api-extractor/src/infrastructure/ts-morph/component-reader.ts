import type {
    ModuleDeclaration,
    Node,
    SourceFile,
    Symbol as TsSymbol,
    TypeAliasDeclaration,
} from 'ts-morph';
import { ModuleDeclarationKind, ts } from 'ts-morph';

import { cleanType } from '~/domain/clean-type';
import type { ParsedComponent, ParsedProp } from '~/domain/model';
import type { Reporter } from '~/domain/reporter';
import type { ParseConfig } from '~/domain/stage-config';
import { getDefaultValuesForNamespace } from '~/infrastructure/ts-morph/default-values';
import {
    DeclarationSourceType,
    classifyPropSource,
    getDeclarationSourceType,
} from '~/infrastructure/ts-morph/source-classifier';
import { resolveType } from '~/infrastructure/ts-morph/type-printer';
import { buildBaseUiTypeMap } from '~/infrastructure/ts-morph/type-printer/base-ui-mapper';
import type { BaseUiTypeMap } from '~/infrastructure/ts-morph/type-printer/shared';

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

function readDoc(symbol: TsSymbol): string {
    return ts.displayPartsToString(symbol.compilerSymbol.getDocumentationComment(undefined)).trim();
}

function isProjectDeclaration(declaration: Node): boolean {
    return (
        getDeclarationSourceType(declaration.getSourceFile().getFilePath()) ===
        DeclarationSourceType.PROJECT
    );
}

/**
 * A prop declared in more than one place — a base-ui prop that vapor-ui or
 * base-ui itself re-declares — makes `getDocumentationComment` concatenate every
 * JSDoc it finds, and TypeScript only de-duplicates blocks that match exactly.
 * Two near-identical sentences (a straight vs. curly apostrophe is enough) end
 * up glued together in the output.
 *
 * So pick one declaration rather than merging: vapor-ui's own wording wins,
 * otherwise the first declaration that documents the prop at all.
 */
export function getPropDescription(symbol: TsSymbol): string | undefined {
    const declarations = symbol.getDeclarations();

    if (declarations.length <= 1) {
        return readDoc(symbol) || undefined;
    }

    const documented = declarations
        .map((declaration) => ({
            declaration,
            text: readDoc(declaration.getSymbol() ?? symbol),
        }))
        .filter((entry) => entry.text.length > 0);

    if (documented.length === 0) return undefined;

    const own = documented.find((entry) => isProjectDeclaration(entry.declaration));

    return (own ?? documented[0]).text;
}

function extractParsedProp(
    symbol: TsSymbol,
    declNode: Node,
    baseUiMap: BaseUiTypeMap,
    defaultValues: Record<string, string>,
    reporter?: Reporter,
): ParsedProp {
    const name = symbol.getName();
    const typeResult = cleanType(
        resolveType(symbol.getTypeAtLocation(declNode), baseUiMap, declNode, reporter),
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

    options.reporter?.debug(`${namespaceName}: ${allSymbols.length} symbols`);

    const props = allSymbols.map((symbol) => {
        const declNode = symbol.getDeclarations()[0] ?? exportedProps;
        return extractParsedProp(symbol, declNode, baseUiMap, defaultValues, options.reporter);
    });

    return {
        name: namespaceName,
        description: getComponentDescription(sourceFile, namespaceName) ?? undefined,
        props,
    };
}

const DEFAULT_PARSE_CONFIG: ParseConfig = {};

export function parseSourceFile(
    sourceFile: SourceFile,
    options: ParseConfig = DEFAULT_PARSE_CONFIG,
): ParsedComponent[] {
    const baseUiMap = buildBaseUiTypeMap(sourceFile);
    const namespaces = getExportedNamespaces(sourceFile);
    const parsedComponents: ParsedComponent[] = [];

    options.reporter?.debug(`Found ${namespaces.length} namespaces in ${sourceFile.getFilePath()}`);

    for (const namespace of namespaces) {
        try {
            const parsed = extractParsedComponent(sourceFile, namespace, baseUiMap, options);
            if (parsed) {
                parsedComponents.push(parsed);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            options.reporter?.warn(
                `Failed to extract props for ${namespace.getName()}: ${message}`,
            );
        }
    }

    return parsedComponents;
}
