import fs from 'node:fs';
import path from 'node:path';

import type { ExtractorConfig } from '~/config';
import { findComponentFiles, findFileByComponentName } from '~/core/parser/component/scanner';
import type { ExtractOptions } from '~/core/parser/types';
import { findTsconfig } from '~/core/project/config';

// ============================================================
// Types
// ============================================================

/** meow에서 파싱된 raw 옵션 */
export interface RawCliOptions {
    path?: string;
    component?: string;
    all: boolean;
    config?: string;
    noConfig?: boolean;
    verbose?: boolean;
}

/** 검증 후 확정된 옵션 */
export interface ResolvedCliOptions {
    absolutePath: string;
    tsconfigPath: string;
    targetFiles: string[];
    extractOptions: ExtractOptions;
    outputDir: string;
    verbose: boolean;
}

/** 스캔된 컴포넌트 파일 정보 */
interface ScannedComponent {
    filePath: string;
    componentName: string;
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
// Options Builder (Pure Functions)
// ============================================================

export function buildExtractOptions(all: boolean, config: ExtractorConfig): ExtractOptions {
    const { global } = config;

    return {
        filterExternal: !all && global.filterExternal,
        filterHtml: !all && global.filterHtml,
        filterSprinkles: !all && global.filterSprinkles,
        includeHtmlWhitelist: global.includeHtml?.length ? new Set(global.includeHtml) : undefined,
    };
}

export function buildComponentExtractOptions(
    baseOptions: ExtractOptions,
    componentConfig: ExtractorConfig['components'][string] | undefined,
): ExtractOptions {
    if (!componentConfig) {
        return baseOptions;
    }

    const options: ExtractOptions = { ...baseOptions };

    if (componentConfig.include?.length) {
        options.include = [...(options.include ?? []), ...componentConfig.include];
    }

    return options;
}

// ============================================================
// Path Resolution
// ============================================================

function resolvePath(inputPath: string | undefined): string {
    if (!inputPath) {
        throw new CliError('Path is required. Usage: ts-api-extractor <path>');
    }

    const cwd = process.cwd();
    const absolutePath = path.resolve(cwd, inputPath);

    if (!fs.existsSync(absolutePath)) {
        throw new CliError(`Path does not exist: ${absolutePath}`);
    }

    return absolutePath;
}

// ============================================================
// Component Scanning & Validation
// ============================================================

async function scanComponents(
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

function resolveComponentFiles(
    scannedComponents: ScannedComponent[],
    componentName: string | undefined,
): string[] {
    // No component specified → process all
    if (!componentName) {
        return scannedComponents.map((c) => c.filePath);
    }

    // Validate specified component exists
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

export async function resolveOptions(
    raw: RawCliOptions,
    config: ExtractorConfig,
): Promise<ResolvedCliOptions> {
    const absolutePath = resolvePath(raw.path);

    const cwd = process.cwd();
    const tsconfigPath = config.global.tsconfig
        ? path.resolve(cwd, config.global.tsconfig)
        : findTsconfig(absolutePath);

    if (!tsconfigPath) {
        throw new CliError('tsconfig.json not found');
    }

    const scannedComponents = await scanComponents(absolutePath, {
        exclude: config.global.exclude,
        skipDefaultExcludes: !config.global.excludeDefaults,
    });

    const targetFiles = resolveComponentFiles(scannedComponents, raw.component);

    return {
        absolutePath,
        tsconfigPath,
        targetFiles,
        extractOptions: buildExtractOptions(raw.all, config),
        outputDir: path.resolve(cwd, config.global.outputDir),
        verbose: raw.verbose ?? false,
    };
}
