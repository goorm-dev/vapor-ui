/**
 * Namespace parser module
 *
 * Discovers component namespaces and Props interfaces from source files.
 */
import { type ModuleDeclaration, ModuleDeclarationKind, type SourceFile } from 'ts-morph';

export function getExportedNamespaces(sourceFile: SourceFile): ModuleDeclaration[] {
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
