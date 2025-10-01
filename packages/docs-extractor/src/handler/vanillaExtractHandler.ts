import type ts from 'typescript';

/**
 * Checks if a file is a vanilla extract file
 */
export function isVanillaExtractFile(fileName: string): boolean {
    return fileName.endsWith('.css.ts');
}

/**
 * Handles vanilla extract specific prop filtering
 */
export function shouldIncludeVanillaExtractProp(prop: ts.Symbol, checker: ts.TypeChecker): boolean {
    const symbol = prop.valueDeclaration
        ? checker.getSymbolAtLocation(prop.valueDeclaration)
        : prop;

    if (!symbol || !symbol.declarations) {
        return false;
    }

    for (const declaration of symbol.declarations) {
        const { fileName: declarationFileName } = declaration.getSourceFile();

        // Include Vanilla Extract files (.css.ts)
        if (isVanillaExtractFile(declarationFileName)) {
            return true;
        }
    }

    return false;
}

/**
 * Processes vanilla extract related types
 */
export function processVanillaExtractTypes(type: ts.Type, checker: ts.TypeChecker): string {
    // Handle vanilla extract specific type processing
    return checker.typeToString(type);
}
