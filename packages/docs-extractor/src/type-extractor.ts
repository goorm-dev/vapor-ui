import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import { extractDefaultElement, extractDisplayName } from './component-analyzer';
import { resolveExternalTypeFiles } from './external-resolver';
import { extractProps, extractPropsType } from './props-analyzer';
import type { ComponentTypeInfo, TypeExtractorConfig } from './types/types';
import { getJSDocDescription, isReactReturnType, selectNonEmptyArray } from './utils';

/**
 * Creates a TypeScript program with external type files included
 */
export function createTypeScriptProgram(config: TypeExtractorConfig): {
    program: ts.Program;
    checker: ts.TypeChecker;
} {
    const { configPath, files, externalTypePaths, projectRoot } = config;
    const resolvedConfigPath = path.resolve(configPath);
    const projectDirectory = path.dirname(resolvedConfigPath);

    const { config: tsConfig, error } = ts.readConfigFile(configPath, (filePath) =>
        fs.readFileSync(filePath).toString(),
    );

    if (error) {
        throw error;
    }

    const { options, errors, fileNames } = ts.parseJsonConfigFileContent(
        tsConfig,
        ts.sys,
        projectDirectory,
    );

    if (errors.length > 0) throw errors[0];

    // Include external type files (Base UI, React types, etc.)
    const rootDirectory = projectRoot || projectDirectory;
    const externalTypeFiles = resolveExternalTypeFiles(rootDirectory, config.externalTypePaths);
    const resolvedFiles = [...selectNonEmptyArray(files, fileNames), ...externalTypeFiles];

    const program = ts.createProgram(resolvedFiles, options);
    const checker = program.getTypeChecker();

    return { program, checker };
}

/**
 * Extracts component type information from a file
 */
export function extractComponentTypes(
    program: ts.Program,
    checker: ts.TypeChecker,
    filePath: string,
): ComponentTypeInfo[] {
    const sourceFilePath = path.resolve(filePath);
    const sourceFile = program.getSourceFile(sourceFilePath);

    if (!sourceFile) {
        throw new Error(`Cannot find file: ${sourceFilePath}`);
    }

    const components: ComponentTypeInfo[] = [];

    // Get all exported symbols
    const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
    if (moduleSymbol) {
        const exports = checker.getExportsOfModule(moduleSymbol);

        for (const exportSymbol of exports) {
            const exportResults = parseExport(program, checker, exportSymbol, sourceFile);
            if (exportResults) {
                components.push(...exportResults);
            }
        }
    }

    return components;
}

/**
 * Parses an exported symbol to extract component information
 */
function parseExport(
    program: ts.Program,
    checker: ts.TypeChecker,
    exportSymbol: ts.Symbol,
    sourceFile: ts.SourceFile,
): ComponentTypeInfo[] | undefined {
    try {
        const exportDeclaration = exportSymbol.declarations?.[0];
        if (!exportDeclaration) {
            return;
        }

        if (ts.isExportSpecifier(exportDeclaration)) {
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

            return createComponentInfo(
                program,
                checker,
                exportSymbol.name,
                targetSymbol,
                type,
                sourceFile,
            );
        }
    } catch (error) {
        console.error('Export parsing error:', error);
    }
}

/**
 * Creates component type information from symbol and type data
 */
function createComponentInfo(
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
 * Convenience function for extracting component types from a file
 */
export function extractComponentTypesFromFile(
    configPath: string,
    filePath: string,
    includeFiles?: string[],
    externalTypePaths?: string[],
): ComponentTypeInfo[] {
    const config: TypeExtractorConfig = {
        configPath,
        files: includeFiles,
        externalTypePaths,
    };

    const { program, checker } = createTypeScriptProgram(config);
    return extractComponentTypes(program, checker, filePath);
}
