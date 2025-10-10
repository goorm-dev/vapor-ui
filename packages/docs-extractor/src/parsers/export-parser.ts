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
 * Processes export specifier to extract target symbol and type information
 */
export function processExportSpecifier(
    checker: ts.TypeChecker,
    exportDeclaration: ts.ExportSpecifier,
): { targetSymbol: ts.Symbol; type: ts.Type } | undefined {
    // Skip re-exports e.g., export { Button } from './Button';
    if (isReExport(exportDeclaration)) {
        return;
    }

    const targetSymbol = checker.getExportSpecifierLocalTargetSymbol(exportDeclaration);

    if (!targetSymbol) {
        return;
    }

    let type: ts.Type;
    if (targetSymbol.declarations?.length) {
        type = checker.getTypeAtLocation(targetSymbol.declarations[0]);
    } else {
        type = checker.getTypeOfSymbol(targetSymbol);
    }

    return { targetSymbol, type };
}
