import type { ParsedComponent, ParsedProp } from '#model';
import { getDefaultValuesForNamespace } from '#read/default-values';
import { classifyPropSource, isProjectOwned } from '#read/source-classifier';
import { buildBaseUiTypeMap } from '#read/type-printer/base-ui-mapper';
import { resolveType } from '#read/type-printer/resolve-type';
import type { BaseUiTypeMap } from '#read/type-printer/shared';
import { type Reporter, silentReporter } from '#reporter';
import type {
    InterfaceDeclaration,
    ModuleDeclaration,
    Node,
    SourceFile,
    Symbol as TsSymbol,
    TypeAliasDeclaration,
} from 'ts-morph';
import { ModuleDeclarationKind, ts } from 'ts-morph';

function findComponentVariableStatement(sourceFile: SourceFile, namespaceName: string) {
    return sourceFile
        .getVariableStatements()
        .find((statement) =>
            statement
                .getDeclarations()
                .some((declaration) => declaration.getName() === namespaceName),
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

    return jsDocs.at(-1)?.getDescription().trim() || undefined;
}

function getExportedNamespaces(sourceFile: SourceFile): ModuleDeclaration[] {
    return sourceFile
        .getModules()
        .filter(
            (moduleDecl) =>
                moduleDecl.getDeclarationKind() === ModuleDeclarationKind.Namespace &&
                moduleDecl.isExported(),
        );
}

function isExportedProps(declaration: TypeAliasDeclaration | InterfaceDeclaration): boolean {
    return declaration.getName() === 'Props' && declaration.isExported();
}

function findExportedProps(
    namespace: ModuleDeclaration,
): TypeAliasDeclaration | InterfaceDeclaration | undefined {
    return (
        namespace.getTypeAliases().find(isExportedProps) ??
        namespace.getInterfaces().find(isExportedProps)
    );
}

function readDoc(symbol: TsSymbol): string {
    return ts.displayPartsToString(symbol.compilerSymbol.getDocumentationComment(undefined)).trim();
}

function isProjectDeclaration(declaration: Node): boolean {
    return isProjectOwned(declaration.getSourceFile().getFilePath());
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
function getPropDescription(symbol: TsSymbol): string | undefined {
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
    const typeString = resolveType(
        symbol.getTypeAtLocation(declNode),
        baseUiMap,
        declNode,
        reporter,
    );

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
    reporter: Reporter,
): ParsedComponent | null {
    const namespaceName = namespace.getName();
    const exportedProps = findExportedProps(namespace);
    if (!exportedProps) return null;

    const allSymbols = exportedProps.getType().getProperties();
    const declaredPropNames = new Set(allSymbols.map((symbol) => symbol.getName()));
    const defaultValues = getDefaultValuesForNamespace(
        sourceFile,
        namespaceName,
        declaredPropNames,
    );

    reporter.debug(`${namespaceName}: ${allSymbols.length} symbols`);

    const props = allSymbols.map((symbol) => {
        const declNode = symbol.getDeclarations()[0] ?? exportedProps;
        return extractParsedProp(symbol, declNode, baseUiMap, defaultValues, reporter);
    });

    return {
        name: namespaceName,
        description: getComponentDescription(sourceFile, namespaceName) ?? undefined,
        props,
    };
}

/** `failures` names the namespaces that threw while being read; they are not in `components`. */
export function parseSourceFile(
    sourceFile: SourceFile,
    reporter: Reporter = silentReporter,
): { components: ParsedComponent[]; failures: string[] } {
    const baseUiMap = buildBaseUiTypeMap(sourceFile);
    const namespaces = getExportedNamespaces(sourceFile);
    const parsedComponents: ParsedComponent[] = [];
    const failures: string[] = [];

    reporter.debug(`Found ${namespaces.length} namespaces in ${sourceFile.getFilePath()}`);

    for (const namespace of namespaces) {
        try {
            const parsed = extractParsedComponent(sourceFile, namespace, baseUiMap, reporter);
            if (parsed) {
                parsedComponents.push(parsed);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            reporter.warn(`Failed to extract props for ${namespace.getName()}: ${message}`);
            failures.push(namespace.getName());
        }
    }

    return { components: parsedComponents, failures };
}
