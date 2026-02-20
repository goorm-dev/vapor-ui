/**
 * Component discovery module
 *
 * Discovers component namespaces and extracts metadata
 * (JSDoc descriptions, default HTML elements, Props interfaces) from source files.
 */
import {
    type ModuleDeclaration,
    ModuleDeclarationKind,
    type SourceFile,
    SyntaxKind,
} from 'ts-morph';

function findComponentVariableStatement(sourceFile: SourceFile, namespaceName: string) {
    return sourceFile
        .getVariableStatements()
        .find((statement) =>
            statement.getDeclarations().some((d) => d.getName() === namespaceName),
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

    // Use the last JSDoc comment (closest to the declaration)
    return jsDocs.at(-1)!.getDescription().trim() || undefined;
}

export function getDefaultElement(
    sourceFile: SourceFile,
    namespaceName: string,
): string | undefined {
    const variableStatement = findComponentVariableStatement(sourceFile, namespaceName);
    if (!variableStatement) return undefined;

    // Find the 'render' property assignment in the component definition
    const renderProp = variableStatement
        .getDescendantsOfKind(SyntaxKind.PropertyAssignment)
        .find((prop) => prop.getName() === 'render');

    if (!renderProp) return undefined;

    // Extract the fallback JSX element from: render || <element />
    const selfClosing = renderProp.getFirstDescendantByKind(SyntaxKind.JsxSelfClosingElement);
    if (selfClosing) {
        return selfClosing.getTagNameNode().getText();
    }

    const jsxElement = renderProp.getFirstDescendantByKind(SyntaxKind.JsxElement);
    if (jsxElement) {
        return jsxElement.getOpeningElement().getTagNameNode().getText();
    }

    return undefined;
}

export function getExportedNamespaces(sourceFile: SourceFile) {
    return sourceFile
        .getModules()
        .filter(
            (module) =>
                module.getDeclarationKind() === ModuleDeclarationKind.Namespace &&
                module.isExported,
        );
}

export function findExportedInterfaceProps(namespace: ModuleDeclaration) {
    return namespace
        .getInterfaces()
        .find(
            (exportInterface) =>
                exportInterface.getName() === 'Props' && exportInterface.isExported(),
        );
}
