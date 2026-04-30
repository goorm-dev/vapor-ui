import fs from 'node:fs';
import path from 'node:path';

import { loadExtractorConfig } from '~/config/loader';
import type { ExtractorConfig } from '~/config/schema';
import { findComponentFiles, findFileByComponentName } from '~/stages/scan';

export interface ResolvedCliOptions {
    tsconfigPath: string;
    targetFiles: string[];
    config: ExtractorConfig;
}

export interface CliFlagOverrides {
    translate?: boolean;
    skipCache?: boolean;
    verbose?: boolean;
}

export function applyFlagOverrides(config: ExtractorConfig, flags: CliFlagOverrides): void {
    if (flags.translate) {
        if (!process.env['DEEPL_API_KEY']) {
            throw new CliError(
                'DEEPL_API_KEY is not set. Set it in your .env file or environment to use --translate.',
            );
        }
        if (config.translation) {
            config.translation.enabled = true;
        }
    }
    if (flags.skipCache && config.translation) {
        config.translation.skipCache = true;
    }
    if (flags.verbose) {
        config.verbose = true;
    }
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

export async function resolveOptions({
    configPath,
    component,
}: {
    component?: string;
    configPath?: string;
}): Promise<ResolvedCliOptions> {
    const loadedConfig = await loadExtractorConfig({
        configPath: configPath,
    });

    const absolutePath = resolvePath(loadedConfig);

    const cwd = process.cwd();
    const tsconfigPath = path.resolve(cwd, loadedConfig.tsconfig);
    const targetFiles = await resolveTargetFiles(absolutePath, component, loadedConfig);

    return {
        tsconfigPath,
        targetFiles,
        config: loadedConfig,
    };
}
