import fs from 'node:fs';
import path from 'node:path';

import { CliError } from '~/cli/input';
import type { CliInput } from '~/cli/input';
import { defaultExtractorConfig, resolvePackagePaths } from '~/config/defaults';
import type { ExtractorConfig } from '~/config/schema';
import type { ExtractInput } from '~/extract';
import { findComponentFiles, findFileByComponentName } from '~/stages/scan';

function mergeFlagOverrides(config: ExtractorConfig, input: CliInput): ExtractorConfig {
    const next: ExtractorConfig = { ...config };
    if (input.verbose) next.verbose = true;
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

function resolveTsconfigPath(config: ExtractorConfig): string {
    const cwd = process.cwd();
    const absolutePath = path.resolve(cwd, config.tsconfig);

    if (!fs.existsSync(absolutePath)) {
        throw new CliError(`tsconfig file does not exist: ${absolutePath}`);
    }

    return absolutePath;
}

async function resolveTargetFiles(
    absolutePath: string,
    componentName: string | undefined,
): Promise<string[]> {
    const files = await findComponentFiles(absolutePath);

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

export async function resolveRunContext(input: CliInput): Promise<ExtractInput> {
    let base = structuredClone(defaultExtractorConfig);

    if (input.package) {
        const paths = resolvePackagePaths(input.package);
        base = { ...base, ...paths };
    }

    const config = mergeFlagOverrides(base, input);

    const absolutePath = resolvePath(config);
    const tsconfigPath = resolveTsconfigPath(config);
    const targetFiles = await resolveTargetFiles(absolutePath, input.component);

    return {
        tsconfigPath,
        targetFiles,
        config,
    };
}
