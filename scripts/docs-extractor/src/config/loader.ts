import { createJiti } from 'jiti';
import fs from 'node:fs';
import path from 'node:path';

import { CONFIG_FILE_NAMES, DEFAULT_CONFIG } from './defaults';
import type { ExtractorConfig, ExtractorConfigInput } from './schema';
import { ExtractorConfigSchema } from './schema';

export interface LoadConfigOptions {
    configPath?: string;
    noConfig?: boolean;
    cwd?: string;
}

export interface LoadConfigResult {
    config: ExtractorConfig;
    configPath?: string;
    source: 'file' | 'default';
}

export function findConfigFile(cwd: string): string | undefined {
    for (const name of CONFIG_FILE_NAMES) {
        const fullPath = path.join(cwd, name);
        if (fs.existsSync(fullPath)) {
            return fullPath;
        }
    }
    return undefined;
}

export async function loadConfig(options: LoadConfigOptions = {}): Promise<LoadConfigResult> {
    const { configPath, noConfig, cwd = process.cwd() } = options;

    if (noConfig) {
        return { config: DEFAULT_CONFIG, source: 'default' };
    }

    const resolvedPath = configPath ? path.resolve(cwd, configPath) : findConfigFile(cwd);

    if (!resolvedPath || !fs.existsSync(resolvedPath)) {
        return { config: DEFAULT_CONFIG, source: 'default' };
    }

    try {
        const jiti = createJiti(import.meta.url, {
            interopDefault: true,
        });

        const rawConfig = await jiti.import(resolvedPath, { default: true });

        const parsed = ExtractorConfigSchema.safeParse(rawConfig);
        if (!parsed.success) {
            console.warn(`Config validation failed: ${parsed.error.message}`);
            return { config: DEFAULT_CONFIG, source: 'default' };
        }

        return {
            config: parsed.data,
            configPath: resolvedPath,
            source: 'file',
        };
    } catch (error) {
        console.warn(`Failed to load config: ${error}`);
        return { config: DEFAULT_CONFIG, source: 'default' };
    }
}

export function defineConfig(config: ExtractorConfigInput): ExtractorConfig {
    return ExtractorConfigSchema.parse(config);
}

export function getComponentConfig(
    config: ExtractorConfig,
    filePath: string,
): ExtractorConfig['components'][string] | undefined {
    const normalizedPath = filePath.replace(/\\/g, '/');

    for (const [pattern, componentConfig] of Object.entries(config.components)) {
        const normalizedPattern = pattern.replace(/\\/g, '/');
        if (
            normalizedPath.endsWith(normalizedPattern) ||
            normalizedPath.includes(normalizedPattern)
        ) {
            return componentConfig;
        }
    }

    return undefined;
}
