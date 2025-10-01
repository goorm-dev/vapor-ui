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
 * Gets module symbol from source file
 */
export function getModuleSymbol(
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
 * Pure function to get export declaration from symbol
 */
export function getExportDeclaration(exportSymbol: ts.Symbol): ts.Declaration | undefined {
    return exportSymbol.declarations?.[0];
}

/**
 * Pure function to check if declaration is export specifier
 */
export function isExportSpecifierDeclaration(
    declaration: ts.Declaration,
): declaration is ts.ExportSpecifier {
    return ts.isExportSpecifier(declaration);
}

/**
 * Parse an exported symbol to extract component information
 * Returns Result type to handle errors without side effects
 */
export function parseExport(
    program: ts.Program,
    checker: ts.TypeChecker,
    exportSymbol: ts.Symbol,
    sourceFile: ts.SourceFile,
): { success: true; data: ComponentTypeInfo[] } | { success: false; error: string } | undefined {
    const exportDeclaration = getExportDeclaration(exportSymbol);
    if (!exportDeclaration) {
        return undefined;
    }

    if (isExportSpecifierDeclaration(exportDeclaration)) {
        try {
            const result = handleExportSpecifier(
                program,
                checker,
                exportDeclaration,
                exportSymbol,
                sourceFile,
            );
            return result ? { success: true, data: result } : undefined;
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown export parsing error',
            };
        }
    }

    return undefined;
}
