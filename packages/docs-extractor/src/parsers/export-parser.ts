import ts from 'typescript';

/**
 * Export declaration parsing utilities
 * Handles parsing of TypeScript export declarations
 */

/**
 * Checks if export declaration is a re-export from another module
 */
export function isReExport(exportDeclaration: ts.ExportSpecifier): boolean {
    return (
        ts.isExportDeclaration(exportDeclaration.parent.parent) &&
        exportDeclaration.parent.parent.moduleSpecifier !== undefined
    );
}

/**
 * Gets the local target symbol from export specifier
 */
export function getTargetSymbol(
    checker: ts.TypeChecker,
    exportDeclaration: ts.ExportSpecifier,
): ts.Symbol | undefined {
    return checker.getExportSpecifierLocalTargetSymbol(exportDeclaration);
}

/**
 * Gets the TypeScript type from target symbol
 */
export function getTargetSymbolType(checker: ts.TypeChecker, targetSymbol: ts.Symbol): ts.Type {
    if (targetSymbol.declarations?.length) {
        return checker.getTypeAtLocation(targetSymbol.declarations[0]);
    } else {
        return checker.getTypeOfSymbol(targetSymbol);
    }
}

/**
 * Pure function to get export declaration from symbol
 */
export function getExportDeclaration(exportSymbol: ts.Symbol): ts.Declaration | undefined {
    return exportSymbol.declarations?.[0];
}

/**
 * Pure function to check if declaration is export specifier
 */
export function isExportSpecifierDeclaration(
    declaration: ts.Declaration,
): declaration is ts.ExportSpecifier {
    return ts.isExportSpecifier(declaration);
}

/**
 * Processes export specifier to extract target symbol and type information
 */
export function processExportSpecifier(
    checker: ts.TypeChecker,
    exportDeclaration: ts.ExportSpecifier,
): { targetSymbol: ts.Symbol; type: ts.Type } | null {
    // Skip re-exports e.g., export { Button } from './Button';
    if (isReExport(exportDeclaration)) {
        return null;
    }

    const targetSymbol = getTargetSymbol(checker, exportDeclaration);
    if (!targetSymbol) {
        return null;
    }

    const type = getTargetSymbolType(checker, targetSymbol);

    return { targetSymbol, type };
}
