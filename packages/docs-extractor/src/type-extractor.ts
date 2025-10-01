import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import { resolveExternalTypeFiles } from '~/external-resolver';
import { handleExportSpecifier } from '~/handler/componentHandler';
import type { ComponentTypeInfo, TypeExtractorConfig } from '~/types/types';
import { selectNonEmptyArray } from '~/utils';

/**
 * Creates a TypeScript program with external type files included
 */
export const createTypeScriptProgram = (config: TypeExtractorConfig): ts.Program => {
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
    const externalTypeFiles = resolveExternalTypeFiles(rootDirectory, externalTypePaths);
    const selectedFiles = selectNonEmptyArray(files, fileNames);
    const absoluteFiles = selectedFiles.map((file) =>
        path.isAbsolute(file) ? file : path.resolve(projectDirectory, file),
    );
    const resolvedFiles = [...absoluteFiles, ...externalTypeFiles];

    const program = ts.createProgram(resolvedFiles, options);

    return program;
};

/**
 * Extracts component type information from a file
 */
/**
 * Processes export results and adds them to components array
 */
function processExportResults(
    exportResults: ComponentTypeInfo[] | undefined,
    components: ComponentTypeInfo[],
): ComponentTypeInfo[] {
    if (exportResults) {
        return [...components, ...exportResults];
    }
    return components;
}

/**
 * Gets module symbol from source file
 */
function getModuleSymbol(
    checker: ts.TypeChecker,
    program: ts.Program,
    filePath: string,
): { moduleSymbol: ts.Symbol; sourceFile: ts.SourceFile } | null {
    const sourceFilePath = path.resolve(filePath);
    const sourceFile = program.getSourceFile(sourceFilePath);

    if (!sourceFile) {
        throw new Error(`Cannot find file: ${sourceFilePath}`);
    }

    const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
    if (!moduleSymbol) {
        return null;
    }

    return { moduleSymbol, sourceFile };
}

/**
 * Processes exported symbols to extract component information
 */
function processExportedSymbols(
    program: ts.Program,
    checker: ts.TypeChecker,
    moduleSymbol: ts.Symbol,
    sourceFile: ts.SourceFile,
): ComponentTypeInfo[] {
    const exports = checker.getExportsOfModule(moduleSymbol);
    let components: ComponentTypeInfo[] = [];

    for (const exportSymbol of exports) {
        const exportResults = parseExport(program, checker, exportSymbol, sourceFile);
        components = processExportResults(exportResults, components);
    }

    return components;
}

export function extractComponentTypes(
    program: ts.Program,
    checker: ts.TypeChecker,
    filePath: string,
): ComponentTypeInfo[] {
    const moduleInfo = getModuleSymbol(checker, program, filePath);
    if (!moduleInfo) {
        return [];
    }

    return processExportedSymbols(program, checker, moduleInfo.moduleSymbol, moduleInfo.sourceFile);
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
            return handleExportSpecifier(program, checker, exportDeclaration, exportSymbol, sourceFile);
        }
    } catch (error) {
        console.error('Export parsing error:', error);
    }
}

