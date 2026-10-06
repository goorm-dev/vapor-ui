import type { ParsedComponent, ParsedProp } from '#model';
import { getDefaultValuesForComponent } from '#read/default-values';
import { classifyPropSource, isProjectOwned } from '#read/source-classifier';
import { buildBaseUiTypeMap } from '#read/type-printer/base-ui-mapper';
import { resolveType } from '#read/type-printer/resolve-type';
import type { BaseUiTypeMap } from '#read/type-printer/shared';
import { type Reporter, silentReporter } from '#reporter';
import type {
    InterfaceDeclaration,
    ModuleDeclaration,
    SourceFile,
    Symbol as TsSymbol,
    TypeAliasDeclaration,
    VariableDeclaration,
} from 'ts-morph';
import { ModuleDeclarationKind, Node, ts } from 'ts-morph';

function findComponentValueDeclaration(
    namespace: ModuleDeclaration,
): VariableDeclaration | undefined {
    const valueDeclaration = namespace.getSymbol()?.getValueDeclaration();
    return Node.isVariableDeclaration(valueDeclaration) ? valueDeclaration : undefined;
}

function getComponentDescription(
    componentImplementation: VariableDeclaration | undefined,
): string | undefined {
    const variableStatement = componentImplementation?.getVariableStatement();
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

function getPropDescription(symbol: TsSymbol): string | undefined {
    const isOwn = (declaration: Node) => isProjectOwned(declaration.getSourceFile().getFilePath());

    return symbol
        .getDeclarations()
        .sort((a, b) => Number(isOwn(b)) - Number(isOwn(a)))
        .map((declaration) =>
            ts
                .displayPartsToString(
                    declaration.getSymbol()?.compilerSymbol.getDocumentationComment(undefined),
                )
                .trim(),
        )
        .find(Boolean);
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

    const componentImplementation = findComponentValueDeclaration(namespace);
    const allSymbols = exportedProps.getType().getProperties();
    const declaredPropNames = new Set(allSymbols.map((symbol) => symbol.getName()));
    const defaultValues = getDefaultValuesForComponent(
        sourceFile,
        componentImplementation,
        declaredPropNames,
    );

    reporter.debug(`${namespaceName}: ${allSymbols.length} symbols`);

    const props = allSymbols.map((symbol) => {
        const declNode = symbol.getDeclarations()[0] ?? exportedProps;
        return extractParsedProp(symbol, declNode, baseUiMap, defaultValues, reporter);
    });

    return {
        name: namespaceName,
        description: getComponentDescription(componentImplementation),
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
