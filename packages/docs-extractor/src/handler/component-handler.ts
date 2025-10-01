import type ts from 'typescript';

import { createComponentInfo } from '~/parsers/component-parser';
import {
    getExportDeclaration,
    isExportSpecifierDeclaration,
    processExportSpecifier,
} from '~/parsers/export-parser';
import { getModuleExports } from '~/parsers/module-parser';
import type { ComponentTypeInfo } from '~/types/types';

/**
 * Component Handler
 * Orchestrates component analysis using parser modules
 */

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

/**
 * Processes all exported symbols from a module for component extraction
 */
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
    const exportsSymbol = getModuleExports(checker, moduleSymbol);
    let components: ComponentTypeInfo[] = [];
    const errors: string[] = [];

    for (const symbol of exportsSymbol) {
        const exportDeclaration = getExportDeclaration(symbol);
        if (!exportDeclaration) {
            continue;
        }

        if (isExportSpecifierDeclaration(exportDeclaration)) {
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
