import fs from 'node:fs';
import path from 'node:path';

// Dynamic import to avoid loading @inquirer/prompts in CI environments
async function getPrompts() {
    try {
        return await import('@inquirer/prompts');
    } catch {
        throw new CliError(
            'Interactive mode requires @inquirer/prompts. ' +
                'Provide --path and --component CLI arguments instead, or install: pnpm add @inquirer/prompts',
        );
    }
}

import { findComponentFiles, findFileByComponentName, findTsconfig } from '~/core/discovery';
import type { ExtractOptions } from '~/core/props-extractor';

// ============================================================
// Error Classes
// ============================================================

export class CliError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CliError';
    }
}

// ============================================================
// Types
// ============================================================

/** meow에서 파싱된 raw 옵션 */
export interface RawCliOptions {
    path?: string;
    tsconfig?: string;
    exclude: string[];
    excludeDefaults: boolean;
    component?: string;
    outputDir?: string;
    all: boolean;
    include?: string[];
    includeHtml?: string[];
    config?: string;
    noConfig?: boolean;
    lang?: string;
}

/** 프롬프트/검증 후 확정된 옵션 */
export interface ResolvedCliOptions {
    absolutePath: string;
    tsconfigPath: string;
    targetFiles: string[];
    extractOptions: ExtractOptions;
    outputMode: OutputMode;
}

export type OutputMode = { type: 'stdout' } | { type: 'directory'; path: string };

/** 스캔된 컴포넌트 파일 정보 */
export interface ScannedComponent {
    filePath: string;
    componentName: string;
}

/** 유효성 검사 결과 */
type ValidationResult = { valid: true; file: string } | { valid: false; available: string[] };

// ============================================================
// Step 1: Path Resolution (CLI > Prompt)
// ============================================================

export async function resolvePath(filePath?: string): Promise<string> {
    const cwd = process.cwd();

    if (filePath) {
        const absolutePath = path.resolve(cwd, filePath);
        if (!fs.existsSync(absolutePath)) {
            throw new CliError(`Path does not exist: ${absolutePath}`);
        }
        return absolutePath;
    }

    const { input } = await getPrompts();
    const inputPath = await input({
        message: '컴포넌트 경로를 입력하세요:',
        default: '.',
        validate: (value: string) => {
            const resolved = path.resolve(cwd, value.trim());
            if (!fs.existsSync(resolved)) {
                return `경로가 존재하지 않습니다: ${resolved}`;
            }
            return true;
        },
    });

    return path.resolve(cwd, inputPath.trim());
}

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
// Step 3: Component Selection (CLI > Checkbox Prompt)
// ============================================================

const SELECT_ALL_VALUE = '__SELECT_ALL__';

export async function resolveComponentSelection(
    scannedComponents: ScannedComponent[],
    cliComponent?: string,
): Promise<string[]> {
    // Case A: CLI option provided - validate against scanned files
    if (cliComponent) {
        const validation = validateComponent(scannedComponents, cliComponent);

        if (!validation.valid) {
            throw new CliError(
                `Component '${cliComponent}' not found.\nAvailable: ${validation.available.join(', ')}`,
            );
        }

        return [validation.file];
    }

    // Case B: No CLI option - show interactive checkbox prompt
    const choices = [
        { name: '[ 전체 선택 ]', value: SELECT_ALL_VALUE },
        ...scannedComponents.map((comp) => ({
            name: comp.componentName,
            value: comp.filePath,
        })),
    ];

    const { checkbox } = await getPrompts();
    const selected = await checkbox({
        message: '추출할 컴포넌트를 선택하세요:',
        choices,
        required: true,
    });

    if (selected.includes(SELECT_ALL_VALUE)) {
        return scannedComponents.map((c) => c.filePath);
    }

    return selected;
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
// Extract Options Builder
// ============================================================

function buildExtractOptions(raw: RawCliOptions, configFilterSprinkles?: boolean): ExtractOptions {
    return {
        filterExternal: !raw.all,
        filterSprinkles: !raw.all && (configFilterSprinkles ?? true),
        filterHtml: !raw.all,
        includeHtmlWhitelist: raw.includeHtml?.length ? new Set(raw.includeHtml) : undefined,
        include: raw.include,
    };
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
    };
}
