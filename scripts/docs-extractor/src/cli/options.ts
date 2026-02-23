import fs from 'node:fs';
import path from 'node:path';

import { buildExtractOptions, config } from '~/config';
import { findComponentFiles, findFileByComponentName } from '~/core/parser/component/scanner';
import type { ExtractOptions } from '~/core/parser/types';
import { findTsconfig } from '~/core/project/config';

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

interface ScannedComponent {
    filePath: string;
    componentName: string;
}

async function scanComponents(absolutePath: string): Promise<ScannedComponent[]> {
    const files = await findComponentFiles(absolutePath, {
        exclude: config.exclude,
        skipDefaultExcludes: !config.excludeDefaults,
    });

    if (files.length === 0) {
        throw new CliError('No .tsx files found in the specified path');
    }

    return files.map((filePath) => ({
        filePath,
        componentName: path.basename(filePath, '.tsx'),
    }));
}

function resolveComponentFiles(
    scannedComponents: ScannedComponent[],
    componentName: string | undefined,
): string[] {
    if (!componentName) {
        return scannedComponents.map((c) => c.filePath);
    }

    const file = findFileByComponentName(
        scannedComponents.map((c) => c.filePath),
        componentName,
    );

    if (!file) {
        const available = scannedComponents.map((c) => c.componentName).join(', ');
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
    const tsconfigPath = config.tsconfig
        ? path.resolve(cwd, config.tsconfig)
        : findTsconfig(absolutePath);

    if (!tsconfigPath) {
        throw new CliError('tsconfig.json not found');
    }

    const scannedComponents = await scanComponents(absolutePath);
    const targetFiles = resolveComponentFiles(scannedComponents, flags.component);

    return {
        absolutePath,
        tsconfigPath,
        targetFiles,
        extractOptions: buildExtractOptions(flags.all),
        outputDir: path.resolve(cwd, config.outputDir),
        verbose: flags.verbose,
    };
}
