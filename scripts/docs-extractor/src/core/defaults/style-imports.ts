/**
 * Style import analysis module
 *
 * Extracts vanilla-extract style file imports (.css.ts) from component files.
 */
import path from 'node:path';
import type { SourceFile } from 'ts-morph';

import { findImportPaths } from '~/utils/module';

export interface CssImport {
    modulePath: string;
    resolvedPath: string;
}

export interface VariantsTypeImport {
    typeName: string;
    modulePath: string;
    resolvedPath: string;
}

/**
 * Finds all .css file imports from a component file.
 * e.g. import * as styles from './button.css'
 *      import type { ButtonVariants } from './button.css'
 */
export function findCssImports(sourceFile: SourceFile): CssImport[] {
    const fileDir = path.dirname(sourceFile.getFilePath());

    return findImportPaths(sourceFile, '.css').map((modulePath) => ({
        modulePath,
        resolvedPath: path.resolve(fileDir, `${modulePath}.ts`),
    }));
}

/**
 * Finds type imports from .css files.
 * e.g. import type { ButtonVariants, ListVariants } from './tabs.css'
 */
export function findVariantsTypeImports(sourceFile: SourceFile): VariantsTypeImport[] {
    const imports: VariantsTypeImport[] = [];
    const fileDir = path.dirname(sourceFile.getFilePath());

    for (const importDecl of sourceFile.getImportDeclarations()) {
        const modulePath = importDecl.getModuleSpecifierValue();

        if (!modulePath.endsWith('.css')) continue;

        for (const namedImport of importDecl.getNamedImports()) {
            const typeName = namedImport.getName();
            if (typeName.endsWith('Variants')) {
                imports.push({
                    typeName,
                    modulePath,
                    resolvedPath: path.resolve(fileDir, `${modulePath}.ts`),
                });
            }
        }
    }

    return imports;
}
