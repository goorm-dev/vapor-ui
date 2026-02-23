import fs from 'node:fs';
import path from 'node:path';

import { buildExtractOptions, config } from '~/config';
import { findComponentFiles, findFileByComponentName } from '~/core/parser/component/scanner';
import type { ExtractOptions } from '~/core/parser/types';

// ============================================================
// Types
// ============================================================

export interface ResolvedCliOptions {
    absolutePath: string;
    tsconfigPath: string;
    targetFiles: string[];
    extractOptions: ExtractOptions;
    outputDir: string;
    verbose: boolean;
}

// ============================================================
// Error
// ============================================================

export class CliError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CliError';
    }
}

// ============================================================
// Path Resolution
// ============================================================

function resolvePath(): string {
    const cwd = process.cwd();
    const absolutePath = path.resolve(cwd, config.inputPath);

    if (!fs.existsSync(absolutePath)) {
        throw new CliError(`Path does not exist: ${absolutePath}`);
    }

    return absolutePath;
}

// ============================================================
// Component Scanning
// ============================================================

async function resolveTargetFiles(
    absolutePath: string,
    componentName: string | undefined,
): Promise<string[]> {
    const files = await findComponentFiles(absolutePath, {
        exclude: config.exclude,
        skipDefaultExcludes: !config.excludeDefaults,
    });

    if (files.length === 0) {
        throw new CliError('No .tsx files found in the specified path');
    }

    if (!componentName) {
        return files;
    }

    const file = findFileByComponentName(files, componentName);

    if (!file) {
        const available = files.map((f) => path.basename(f, '.tsx')).join(', ');
        throw new CliError(`Component '${componentName}' not found.\nAvailable: ${available}`);
    }

    return [file];
}

// ============================================================
// Main Resolver
// ============================================================

export async function resolveOptions(flags: {
    component?: string;
    all: boolean;
    verbose: boolean;
}): Promise<ResolvedCliOptions> {
    const absolutePath = resolvePath();

    const cwd = process.cwd();
    const tsconfigPath = path.resolve(cwd, config.tsconfig);
    const targetFiles = await resolveTargetFiles(absolutePath, flags.component);

    return {
        absolutePath,
        tsconfigPath,
        targetFiles,
        extractOptions: buildExtractOptions(flags.all),
        outputDir: path.resolve(cwd, config.outputDir),
        verbose: flags.verbose,
    };
}
