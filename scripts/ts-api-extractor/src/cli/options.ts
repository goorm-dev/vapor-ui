import fs from 'node:fs';
import path from 'node:path';

import { loadExtractorConfig } from '~/config/loader';
import type { ExtractorConfig } from '~/config/schema';
import { findComponentFiles, findFileByComponentName } from '~/stages/scan';

export interface ExtractorRunContext {
    tsconfigPath: string;
    targetFiles: string[];
    config: ExtractorConfig;
}

export interface CliInput {
    component?: string;
    configPath?: string;
    translate?: boolean;
    skipCache?: boolean;
    verbose?: boolean;
}

export class CliError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CliError';
    }
}

function mergeFlagOverrides(config: ExtractorConfig, input: CliInput): ExtractorConfig {
    const next: ExtractorConfig = {
        ...config,
        translation: { ...config.translation },
    };

    if (input.translate) {
        if (!process.env['DEEPL_API_KEY']) {
            throw new CliError(
                'DEEPL_API_KEY is not set. Set it in your .env file or environment to use --translate.',
            );
        }
        next.translation.enabled = true;
    }

    if (input.skipCache) {
        next.translation.skipCache = true;
    }

    if (input.verbose) {
        next.verbose = true;
    }

    return next;
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

export async function resolveRunContext(input: CliInput): Promise<ExtractorRunContext> {
    const loaded = await loadExtractorConfig({ configPath: input.configPath });

    const config = mergeFlagOverrides(loaded, input);

    const absolutePath = resolvePath(config);
    const cwd = process.cwd();
    const tsconfigPath = path.resolve(cwd, config.tsconfig);
    const targetFiles = await resolveTargetFiles(absolutePath, input.component, config);

    return {
        tsconfigPath,
        targetFiles,
        config,
    };
}
