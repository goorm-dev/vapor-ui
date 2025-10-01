import ts from 'typescript';

import { extractDefaultElement, extractDisplayName } from '~/component-analyzer';
import { extractProps, extractPropsType } from '~/props-analyzer';
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
 * Handles export specifier parsing for components
 */
export function handleExportSpecifier(
    program: ts.Program,
    checker: ts.TypeChecker,
    exportDeclaration: ts.ExportSpecifier,
    exportSymbol: ts.Symbol,
    sourceFile: ts.SourceFile,
): ComponentTypeInfo[] | undefined {
    // export { Button } pattern
    if (
        ts.isExportDeclaration(exportDeclaration.parent.parent) &&
        exportDeclaration.parent.parent.moduleSpecifier !== undefined
    ) {
        // Skip re-exports e.g., export { Button } from './Button';
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

    return createComponentInfo(program, checker, exportSymbol.name, targetSymbol, type, sourceFile);
}
