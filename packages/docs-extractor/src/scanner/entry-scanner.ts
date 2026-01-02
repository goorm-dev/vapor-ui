import { type SourceFile } from 'ts-morph';

import type { Logger } from '../utils/logger';

/**
 * Information about an export from src/index.ts
 */
export interface ExportInfo {
    /** Module path (e.g., './components/button/button') */
    modulePath: string;
    /** Whether it's a namespace export (export * as Name from ...) */
    isNamespace: boolean;
    /** Namespace name if isNamespace is true */
    namespaceName?: string;
    /** Specific named exports if not a star export */
    namedExports?: string[];
}

/**
 * Entry Scanner - analyzes src/index.ts to find exported components
 *
 * This scanner parses the entry point file to identify:
 * - `export * from './components/...'` - re-exports all from a module
 * - `export * as Name from './components/...'` - namespace exports
 * - `export { A, B } from './components/...'` - named exports
 */
export class EntryScanner {
    constructor(private logger: Logger) {}

    /**
     * Scan the entry file (src/index.ts) for export statements
     */
    scanEntryFile(sourceFile: SourceFile): ExportInfo[] {
        const exports: ExportInfo[] = [];

        // Get all export declarations
        const exportDeclarations = sourceFile.getExportDeclarations();

        for (const exportDecl of exportDeclarations) {
            const moduleSpecifier = exportDecl.getModuleSpecifierValue();

            if (!moduleSpecifier) {
                continue;
            }

            // Check if it's a namespace export (export * as Name from ...)
            const namespaceExport = exportDecl.getNamespaceExport();
            if (namespaceExport) {
                exports.push({
                    modulePath: moduleSpecifier,
                    isNamespace: true,
                    namespaceName: namespaceExport.getName(),
                });
                this.logger.debug(
                    `Found namespace export: ${namespaceExport.getName()} from ${moduleSpecifier}`,
                );
                continue;
            }

            // Check if it's a star export (export * from ...)
            if (exportDecl.isNamespaceExport()) {
                exports.push({
                    modulePath: moduleSpecifier,
                    isNamespace: false,
                });
                this.logger.debug(`Found star export from ${moduleSpecifier}`);
                continue;
            }

            // Named exports (export { A, B } from ...)
            const namedExports = exportDecl.getNamedExports();
            if (namedExports.length > 0) {
                const names = namedExports.map((ne) => {
                    const alias = ne.getAliasNode();
                    return alias ? alias.getText() : ne.getName();
                });

                exports.push({
                    modulePath: moduleSpecifier,
                    isNamespace: false,
                    namedExports: names,
                });
                this.logger.debug(
                    `Found named exports: ${names.join(', ')} from ${moduleSpecifier}`,
                );
            }
        }

        return exports;
    }

    /**
     * Filter exports to only include component-related paths
     */
    filterComponentExports(exports: ExportInfo[]): ExportInfo[] {
        return exports.filter((exp) => exp.modulePath.includes('/components/'));
    }

    /**
     * Extract component name from module path
     * @example './components/button/button' → 'Button'
     */
    extractComponentName(modulePath: string): string | null {
        const match = modulePath.match(/\/components\/([^/]+)/);
        if (!match) {
            return null;
        }

        const dirName = match[1];
        // Capitalize first letter (kebab-case to PascalCase not needed here as dir is lowercase)
        return dirName.charAt(0).toUpperCase() + dirName.slice(1);
    }
}
