import path from 'node:path';

import { findComponentFiles, findFileByComponentName, findTsconfig } from '~/core/discovery';

import { CliError } from './errors.js';
import { buildExtractOptions } from './options-builder.js';
import { resolveComponentSelection, resolvePath } from './prompts.js';
import type {
    OutputMode,
    RawCliOptions,
    ResolvedCliOptions,
    ScannedComponent,
    ValidationResult,
} from './types.js';

// ============================================================
// Step 2: Directory Scan (Source of Truth)
// ============================================================

export async function scanComponents(
    absolutePath: string,
    options: { exclude: string[]; skipDefaultExcludes: boolean },
): Promise<ScannedComponent[]> {
    const files = await findComponentFiles(absolutePath, {
        exclude: options.exclude,
        skipDefaultExcludes: options.skipDefaultExcludes,
    });

    if (files.length === 0) {
        throw new CliError('No .tsx files found in the specified path');
    }

    return files.map((filePath) => ({
        filePath,
        componentName: path.basename(filePath, '.tsx'),
    }));
}

// ============================================================
// Validation
// ============================================================

export function validateComponent(
    scanned: ScannedComponent[],
    requested: string,
): ValidationResult {
    const available = scanned.map((c) => c.componentName);
    const file = findFileByComponentName(
        scanned.map((c) => c.filePath),
        requested,
    );

    if (file) {
        return { valid: true, file };
    }

    return { valid: false, available };
}

// ============================================================
// Output Mode Resolution
// ============================================================

function resolveOutputMode(outputDir?: string): OutputMode {
    if (outputDir) {
        const cwd = process.cwd();
        return { type: 'directory', path: path.resolve(cwd, outputDir) };
    }
    return { type: 'stdout' };
}

// ============================================================
// Main Orchestrator
// ============================================================

export interface ResolveOptionsConfig {
    filterSprinkles?: boolean;
}

export async function resolveOptions(
    raw: RawCliOptions,
    configOptions?: ResolveOptionsConfig,
): Promise<ResolvedCliOptions> {
    // Step 1: Resolve path (CLI > prompt)
    const absolutePath = await resolvePath(raw.path);

    // Resolve tsconfig
    const cwd = process.cwd();
    const tsconfigPath = raw.tsconfig
        ? path.resolve(cwd, raw.tsconfig)
        : findTsconfig(absolutePath);

    if (!tsconfigPath) {
        throw new CliError('tsconfig.json not found');
    }

    // Step 2: Scan directory (Source of Truth)
    const scannedComponents = await scanComponents(absolutePath, {
        exclude: raw.exclude,
        skipDefaultExcludes: !raw.excludeDefaults,
    });

    // Step 3: Resolve component selection (CLI > checkbox prompt)
    const targetFiles = await resolveComponentSelection(scannedComponents, raw.component);

    return {
        absolutePath,
        tsconfigPath,
        targetFiles,
        extractOptions: buildExtractOptions(raw, configOptions?.filterSprinkles),
        outputMode: resolveOutputMode(raw.outputDir),
        verbose: raw.verbose ?? false,
    };
}
