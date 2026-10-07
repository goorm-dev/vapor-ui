import type { ParsedComponent, ParsedProp } from '#model';
import { getDefaultValuesForComponent } from '#read/default-values';
import { type PublicNames, createPublicNames } from '#read/public-names';
import { classifyPropSource, isProjectOwned } from '#read/source-classifier';
import { type TypePrinter, createTypePrinter } from '#read/type-printer/printer';
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

const isOwn = (declaration: Node) => isProjectOwned(declaration.getSourceFile().getFilePath());

/** Base UI tags props it keeps out of its own docs (the internal `id`) with `@ignore`. A vapor-ui re-declaration brings the prop back. */
function isIgnored(symbol: TsSymbol): boolean {
    const declarations = symbol.getDeclarations();
    if (declarations.some(isOwn)) return false;

    return declarations.some((declaration) =>
        ts.getJSDocTags(declaration.compilerNode).some((tag) => tag.tagName.text === 'ignore'),
    );
}

function getPropDescription(symbol: TsSymbol): string | undefined {
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
    printer: TypePrinter,
    defaultValues: Record<string, string>,
): ParsedProp {
    const name = symbol.getName();

    return {
        name,
        ...printer.members(symbol.getTypeAtLocation(declNode), declNode),
        isOptional: symbol.isOptional(),
        isIgnored: isIgnored(symbol),
        source: classifyPropSource(symbol),
        description: getPropDescription(symbol),
        defaultValue: defaultValues[name],
    };
}

/**
 * Bodies of the public vapor-ui type names the props print. A name is printed once per
 * component; names inside a body are not followed.
 */
function getTypeRefs(
    props: ParsedProp[],
    location: Node,
    publicNames: PublicNames,
    printer: TypePrinter,
): Record<string, string> {
    const names = new Set(props.flatMap((prop) => prop.typeRefs));

    return Object.fromEntries(
        [...names].flatMap((name) => {
            const type = publicNames.typeOf(name);
            return type ? [[name, printer.definition(type, location)]] : [];
        }),
    );
}

function extractParsedComponent(
    sourceFile: SourceFile,
    namespace: ModuleDeclaration,
    publicNames: PublicNames,
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

    const printer = createTypePrinter({ publicNames, namespace: namespaceName });
    const props = allSymbols.map((symbol) => {
        const declNode = symbol.getDeclarations()[0] ?? exportedProps;
        return extractParsedProp(symbol, declNode, printer, defaultValues);
    });

    return {
        name: namespaceName,
        description: getComponentDescription(componentImplementation),
        props,
        typeRefs: getTypeRefs(props, exportedProps, publicNames, printer),
    };
}

/** `failures` names the namespaces that threw while being read; they are not in `components`. */
export function parseSourceFile(
    sourceFile: SourceFile,
    reporter: Reporter = silentReporter,
): { components: ParsedComponent[]; failures: string[] } {
    const publicNames = createPublicNames(sourceFile, reporter);
    const namespaces = getExportedNamespaces(sourceFile);
    const parsedComponents: ParsedComponent[] = [];
    const failures: string[] = [];

    reporter.debug(`Found ${namespaces.length} namespaces in ${sourceFile.getFilePath()}`);

    for (const namespace of namespaces) {
        try {
            const parsed = extractParsedComponent(sourceFile, namespace, publicNames, reporter);
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
