import { globby } from 'globby';
import * as path from 'path';
import * as ts from 'typescript';
import * as tae from 'typescript-api-extractor';

import type { ConfigResult, FileResolutionResult, TSConfig } from './types';
/**
 * Loads TypeScript configuration and returns config with directory path
 */
export function loadTypeScriptConfig(configPath: string): ConfigResult {
    const config = tae.loadConfig(configPath);
    const configDir = path.dirname(configPath);
    return { config, configDir };
}

/**
 * Resolves file patterns to actual file paths
 */
export async function resolveFiles(
    files: string[],
    configDir: string,
    externalTypePaths: string[],
): Promise<FileResolutionResult> {
    const patterns = files.length > 0 ? files : ['**/*.{ts,tsx}'];

    const resolvedFiles = await globby(patterns, {
        cwd: configDir,
        absolute: false,
        onlyFiles: true,
        ignore: ['**/*.stories.{ts,tsx}', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    });

    const absoluteFiles = resolvedFiles.map((file) =>
        path.isAbsolute(file) ? file : path.resolve(configDir, file),
    );

    const resolvedFilesForProgram = [...absoluteFiles, ...externalTypePaths];

    return { resolvedFiles: resolvedFilesForProgram };
}

/**
 * Creates TypeScript program and type checker
 */
export function createTypeScriptProgram(files: string[], config: TSConfig) {
    const program = ts.createProgram(files, config.options);
    const checker = program.getTypeChecker();

    return { program, checker };
}
