import type ts from 'typescript';

/**
 * Processes vanilla extract related types
 */
export function processVanillaExtractTypes(type: ts.Type, checker: ts.TypeChecker): string {
    // Handle vanilla extract specific type processing
    return checker.typeToString(type);
}
