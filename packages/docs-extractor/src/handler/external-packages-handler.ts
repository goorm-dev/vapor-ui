import type ts from 'typescript';

/**
 * Checks if a declaration comes from Base UI components
 */
export function isBaseUIDeclaration(fileName: string): boolean {
    return (
        fileName.includes('node_modules/@base-ui-components/react/esm') &&
        fileName.endsWith('.d.ts')
    );
}

/**
 * Checks if a declaration comes from project's own type definitions
 */
export function isProjectTypeDeclaration(fileName: string): boolean {
    return (
        fileName.includes('packages/core/src') &&
        (fileName.endsWith('.ts') || fileName.endsWith('.tsx'))
    );
}

/**
 * Handles external package prop filtering
 */
export function shouldIncludeExternalProp(
    prop: ts.Symbol,
    checker: ts.TypeChecker,
    sourceFile: ts.SourceFile,
): boolean {
    const symbol = prop.valueDeclaration
        ? checker.getSymbolAtLocation(prop.valueDeclaration)
        : prop;

    if (!symbol || !symbol.declarations) {
        return false;
    }

    for (const declaration of symbol.declarations) {
        const { fileName: declarationFileName } = declaration.getSourceFile();

        // Component file itself (current source file)
        if (declarationFileName === sourceFile.fileName) {
            return true;
        }

        // Base UI component d.ts files
        if (isBaseUIDeclaration(declarationFileName)) {
            return true;
        }

        // Project's own type definition files
        if (isProjectTypeDeclaration(declarationFileName)) {
            return true;
        }
    }

    return false;
}

/**
 * Processes external package types
 */
export function processExternalTypes(type: ts.Type, checker: ts.TypeChecker): string {
    // Handle external package specific type processing
    return checker.typeToString(type);
}
