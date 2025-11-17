import * as ts from 'typescript';

import { createComponentInfo } from '~/parsers/component-parser';
import { processExportSpecifier } from '~/parsers/export-parser';
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
    excludeSprinkles?: boolean,
): ComponentTypeInfo[] | undefined {
    const result = processExportSpecifier(checker, exportDeclaration);

    if (!result) {
        return;
    }

    const { targetSymbol, type } = result;
    return createComponentInfo(
        program,
        checker,
        exportSymbol.name,
        targetSymbol,
        type,
        sourceFile,
        excludeSprinkles,
    );
}

/**
 * Processes all exported symbols from a module for component extraction
 */
export const processComponentExportedSymbols = ({
    program,
    checker,
    sourceFile,
    excludeSprinkles,
}: {
    program: ts.Program;
    checker: ts.TypeChecker;
    sourceFile: ts.SourceFile;
    excludeSprinkles?: boolean;
}) => {
    let components: ComponentTypeInfo[] = [];
    const errors: string[] = [];

    try {
        const sourceFileSymbol = checker.getSymbolAtLocation(sourceFile);

        if (!sourceFileSymbol) {
            throw new Error('Failed to get the source file symbol');
        }

        const exportedSymbols = checker.getExportsOfModule(sourceFileSymbol);

        for (const symbol of exportedSymbols) {
            const exportDeclaration = symbol.declarations?.[0];

            if (!exportDeclaration) {
                throw new Error(`No declaration found for symbol: ${symbol.name}`);
            }

            if (ts.isExportSpecifier(exportDeclaration)) {
                try {
                    const result = handleExportSpecifier(
                        program,
                        checker,
                        exportDeclaration,
                        symbol,
                        sourceFile,
                        excludeSprinkles,
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
    } catch (error) {
        throw error;
    }

    return components;
};
