import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { defaultExtractorConfig } from '~/domain/config/defaults';
import type { ExtractorConfig, PartialExtractorConfig } from '~/domain/config/schema';
import { mergeConfig, validatePartialConfig } from '~/domain/config/schema';
import { ExtractorError } from '~/domain/errors';

/**
 * Config file search order. `.ts` is included for convenience but requires
 * Node.js v22.6.0+ (native TypeScript type-stripping). On Node 20.x–22.5.x,
 * use `.mjs`, `.js`, or `.cjs` config files instead.
 */
const DEFAULT_CONFIG_FILES = [
    'docs-extractor.config.mjs',
    'docs-extractor.config.js',
    'docs-extractor.config.cjs',
    'docs-extractor.config.ts',
] as const;

export interface LoadConfigOptions {
    cwd?: string;
    configPath?: string;
    noConfig?: boolean;
}

function resolveConfigFilePath(options: LoadConfigOptions): string | null {
    const cwd = options.cwd ?? process.cwd();

    if (options.noConfig) return null;

    if (options.configPath) {
        const absolute = path.resolve(cwd, options.configPath);
        if (!fs.existsSync(absolute)) {
            throw new ExtractorError(`Config file not found: ${absolute}`);
        }
        return absolute;
    }

    for (const fileName of DEFAULT_CONFIG_FILES) {
        const absolute = path.resolve(cwd, fileName);
        if (fs.existsSync(absolute)) {
            return absolute;
        }
    }

    return null;
}

async function loadConfigModule(filePath: string): Promise<PartialExtractorConfig> {
    const fileUrl = pathToFileURL(filePath).href;
    const loaded = await import(fileUrl);
    // Supports: export default config, export { config }, or direct module exports
    const value = loaded.default ?? loaded.config ?? loaded;

    if (typeof value !== 'object' || value === null) {
        throw new Error(`Invalid config export in ${filePath}: expected object`);
    }

    return value as PartialExtractorConfig;
}

export async function loadExtractorConfig(
    options: LoadConfigOptions = {},
): Promise<ExtractorConfig> {
    const configFilePath = resolveConfigFilePath(options);

    if (!configFilePath) {
        throw new ExtractorError(
            `No config file found. Looked for: ${DEFAULT_CONFIG_FILES.join(', ')}. ` +
                'inputPath, tsconfig and outputDir have no defaults and must be configured.',
        );
    }

    const partial = await loadConfigModule(configFilePath);
    validatePartialConfig(partial);

    return mergeConfig(defaultExtractorConfig, partial);
}
