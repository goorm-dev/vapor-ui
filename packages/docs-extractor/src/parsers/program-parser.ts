import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import type { TypeExtractorConfig } from '~/types/types';
import { selectNonEmptyArray } from '~/utils';

import { resolveExternalTypeFiles } from './external-type-parser';

/**
 * TypeScript program parsing utilities
 * Handles TypeScript program creation and configuration
 */

/**
 * Creates a TypeScript program with external type files included
 */
export function createTypeScriptProgram(config: TypeExtractorConfig): ts.Program {
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
}
