import ts from 'typescript';

import { extractDefaultElement, extractDisplayName } from '~/component-analyzer';
import { extractProps, extractPropsType } from '~/props-analyzer';
// Remove this import as it's causing circular dependency
import type { ComponentTypeInfo } from '~/types/types';
import { getJSDocDescription, isReactReturnType } from '~/utils';

/**
 * Creates component type information from symbol and type data
 */
export function createComponentInfo(
    program: ts.Program,
    checker: ts.TypeChecker,
    name: string,
    symbol: ts.Symbol,
    type: ts.Type,
    sourceFile: ts.SourceFile,
): ComponentTypeInfo[] | undefined {
    // Check if it's a React component
    if (!isReactReturnType(type, checker)) {
        return;
    }

    const componentName = name;
    const description = getJSDocDescription(symbol, checker);

    // Extract props
    const propsType = extractPropsType(checker, type);
    const props = propsType ? extractProps(checker, program, propsType, sourceFile) : [];

    // Extract display name and default element
    const displayName = extractDisplayName(symbol);
    const defaultElement = extractDefaultElement(symbol);

    return [
        {
            name: componentName,
            displayName,
            description,
            props,
            defaultElement,
        },
    ];
}

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
export function getTargetSymbolType(
    checker: ts.TypeChecker,
    targetSymbol: ts.Symbol,
): ts.Type {
    if (targetSymbol.declarations?.length) {
        return checker.getTypeAtLocation(targetSymbol.declarations[0]);
    } else {
        return checker.getTypeOfSymbol(targetSymbol);
    }
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

/**
 * Handles export specifier parsing for components
 */
export function handleExportSpecifier(
    program: ts.Program,
    checker: ts.TypeChecker,
    exportDeclaration: ts.ExportSpecifier,
    exportSymbol: ts.Symbol,
    sourceFile: ts.SourceFile,
): ComponentTypeInfo[] | undefined {
    const result = processExportSpecifier(checker, exportDeclaration);
    if (!result) {
        return;
    }

    const { targetSymbol, type } = result;
    return createComponentInfo(program, checker, exportSymbol.name, targetSymbol, type, sourceFile);
}

export const processComponentExportedSymbols = ({
    program,
    checker,
    moduleSymbol,
    sourceFile,
}: {
    program: ts.Program;
    checker: ts.TypeChecker;
    moduleSymbol: ts.Symbol;
    sourceFile: ts.SourceFile;
}) => {
    const exportsSymbol = checker.getExportsOfModule(moduleSymbol);
    let components: ComponentTypeInfo[] = [];
    const errors: string[] = [];

    for (const symbol of exportsSymbol) {
        const exportDeclaration = symbol.declarations?.[0];
        if (!exportDeclaration) {
            continue;
        }

        if (ts.isExportSpecifier(exportDeclaration)) {
            try {
                const result = handleExportSpecifier(
                    program,
                    checker,
                    exportDeclaration,
                    symbol,
                    sourceFile,
                );
                if (result) {
                    components = components.concat(result);
                }
            } catch (error) {
                errors.push(
                    `Error processing ${symbol.name}: ${
                        error instanceof Error ? error.message : 'Unknown export parsing error'
                    }`,
                );
            }
        }
    }

    // Log errors if any occurred (side effect moved to caller)
    if (errors.length > 0) {
        console.error('Export parsing errors:', errors.join(', '));
    }

    return components;
};
