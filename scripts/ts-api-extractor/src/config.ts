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

function pathMatchesPattern(filePath: string, pattern: string): boolean {
    const normalizedFile = filePath.replace(/\\/g, '/');
    const normalizedPattern = pattern.replace(/\\/g, '/');
    return normalizedFile === normalizedPattern || normalizedFile.endsWith('/' + normalizedPattern);
}

export function resolveComponentInclude(
    filePath: string,
    configValue: ExtractorConfig = config,
): string[] | undefined {
    for (const [pattern, componentConfig] of Object.entries(configValue.components)) {
        if (pathMatchesPattern(filePath, pattern) && componentConfig.include?.length) {
            return componentConfig.include;
        }
    }
    return undefined;
}
