import fs from 'node:fs';
import path from 'node:path';

import { loadExtractorConfig } from '~/config';
import type { ExtractorConfig } from '~/config/schema';
import { findComponentFiles, findFileByComponentName } from '~/scan';

export interface ResolvedCliOptions {
    absolutePath: string;
    tsconfigPath: string;
    targetFiles: string[];
    all: boolean;
    outputDir: string;
    verbose: boolean;
    config: ExtractorConfig;
}

export class CliError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CliError';
    }
}

function resolvePath(config: ExtractorConfig): string {
    const cwd = process.cwd();
    const absolutePath = path.resolve(cwd, config.inputPath);

    if (!fs.existsSync(absolutePath)) {
        throw new CliError(`Path does not exist: ${absolutePath}`);
    }

    return absolutePath;
}

async function resolveTargetFiles(
    absolutePath: string,
    componentName: string | undefined,
    config: ExtractorConfig,
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

export async function resolveOptions(flags: {
    component?: string;
    all: boolean;
    verbose: boolean;
    config?: string;
    noConfig?: boolean;
}): Promise<ResolvedCliOptions> {
    const loadedConfig = await loadExtractorConfig({
        configPath: flags.config,
        noConfig: flags.noConfig,
    });

    const absolutePath = resolvePath(loadedConfig);

    const cwd = process.cwd();
    const tsconfigPath = path.resolve(cwd, loadedConfig.tsconfig);
    const targetFiles = await resolveTargetFiles(absolutePath, flags.component, loadedConfig);

    return {
        absolutePath,
        tsconfigPath,
        targetFiles,
        all: flags.all,
        outputDir: path.resolve(cwd, loadedConfig.outputDir),
        verbose: flags.verbose,
        config: loadedConfig,
    };
}
