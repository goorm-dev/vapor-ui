/**
 * Module import analysis utilities
 *
 * General-purpose helpers for inspecting import declarations in source files.
 */
import type { SourceFile } from 'ts-morph';

/**
 * Finds deduplicated import module paths matching a given extension.
 * e.g. findImportPaths(sourceFile, '.css') → ['./button.css', './tabs.css']
 */
export function findImportPaths(sourceFile: SourceFile, extension: string): string[] {
    const seen = new Set<string>();

    for (const importDecl of sourceFile.getImportDeclarations()) {
        const modulePath = importDecl.getModuleSpecifierValue();

        if (modulePath.endsWith(extension)) {
            seen.add(modulePath);
        }
    }

    return [...seen];
}

/**
 * Finds the namespace import name for a given module path.
 * e.g. import * as styles from './button.css' → "styles"
 */
export function findNamespaceImportName(sourceFile: SourceFile, modulePath: string): string | null {
    for (const importDecl of sourceFile.getImportDeclarations()) {
        if (importDecl.getModuleSpecifierValue() !== modulePath) continue;

        const namespaceImport = importDecl.getNamespaceImport();
        if (namespaceImport) return namespaceImport.getText();
    }

    return null;
}
