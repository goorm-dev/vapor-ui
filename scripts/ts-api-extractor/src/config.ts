import type { ExtractOptions } from '~/application/dto/extract-options';
import { defaultExtractorConfig } from '~/config/defaults';
import { defineConfig } from '~/config/define-config';
import { type LoadConfigOptions, loadExtractorConfig } from '~/config/loader';
import type { ExtractorConfig } from '~/config/schema';

export { defineConfig, loadExtractorConfig, type LoadConfigOptions };
export type { ExtractorConfig };

/**
 * Backward-compatible default config export.
 * Use loadExtractorConfig() for runtime config resolution.
 */
export const config: ExtractorConfig = defaultExtractorConfig;

export function buildExtractOptions(
    all: boolean,
    configValue: ExtractorConfig = config,
): ExtractOptions {
    return {
        filterExternal: !all && configValue.filterExternal,
        filterHtml: !all && configValue.filterHtml,
        filterSprinkles: !all && configValue.filterSprinkles,
        includeHtmlWhitelist: configValue.includeHtml?.length
            ? new Set(configValue.includeHtml)
            : undefined,
    };
}

export function getComponentExtractOptions(
    baseOptions: ExtractOptions,
    filePath: string,
    configValue: ExtractorConfig = config,
): ExtractOptions {
    const normalizedPath = filePath.replace(/\\/g, '/');

    for (const [pattern, componentConfig] of Object.entries(configValue.components)) {
        const normalizedPattern = pattern.replace(/\\/g, '/');

        if (
            normalizedPath.endsWith(normalizedPattern) ||
            normalizedPath.includes(normalizedPattern)
        ) {
            if (componentConfig.include?.length) {
                return {
                    ...baseOptions,
                    include: [...(baseOptions.include ?? []), ...componentConfig.include],
                };
            }
        }
    }

    return baseOptions;
}

export async function resolveConfigForCli(
    options: LoadConfigOptions = {},
): Promise<ExtractorConfig> {
    return loadExtractorConfig(options);
}
