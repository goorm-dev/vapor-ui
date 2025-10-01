import * as path from 'path';
import type ts from 'typescript';

/**
 * Module parsing utilities
 * Handles TypeScript module and source file operations
 */

/**
 * Gets module symbol from source file
 */
export function getModuleSymbol(
    checker: ts.TypeChecker,
    program: ts.Program,
    filePath: string,
): { moduleSymbol: ts.Symbol; sourceFile: ts.SourceFile } | null {
    const sourceFilePath = path.resolve(filePath);
    const sourceFile = program.getSourceFile(sourceFilePath);

    if (!sourceFile) {
        throw new Error(`Cannot find file: ${sourceFilePath}`);
    }

    const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
    if (!moduleSymbol) {
        return null;
    }

    return { moduleSymbol, sourceFile };
}

/**
 * Gets all exported symbols from a module
 */
export function getModuleExports(checker: ts.TypeChecker, moduleSymbol: ts.Symbol): ts.Symbol[] {
    return checker.getExportsOfModule(moduleSymbol);
}
