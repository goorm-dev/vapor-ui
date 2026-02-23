/**
 * Extractor configuration
 *
 * Hardcoded config for vapor-ui/core extraction.
 */
import type { ExtractOptions } from '~/core/parser/types';

export interface ExtractorConfig {
    inputPath: string;
    tsconfig?: string;
    exclude: string[];
    excludeDefaults: boolean;
    outputDir: string;
    languages: string[];
    filterExternal: boolean;
    filterHtml: boolean;
    filterSprinkles: boolean;
    includeHtml?: string[];
    components: Record<string, { include?: string[] }>;
}

export const config: ExtractorConfig = {
    inputPath: '../../packages/core',
    exclude: [],
    excludeDefaults: true,
    outputDir: '../../apps/website/public/components/generated',
    languages: ['ko', 'en'],
    filterExternal: true,
    filterHtml: true,
    filterSprinkles: true,
    includeHtml: ['className', 'style'],
    components: {},
};

export function buildExtractOptions(all: boolean): ExtractOptions {
    return {
        filterExternal: !all && config.filterExternal,
        filterHtml: !all && config.filterHtml,
        filterSprinkles: !all && config.filterSprinkles,
        includeHtmlWhitelist: config.includeHtml?.length ? new Set(config.includeHtml) : undefined,
    };
}

export function getComponentExtractOptions(
    baseOptions: ExtractOptions,
    filePath: string,
): ExtractOptions {
    const normalizedPath = filePath.replace(/\\/g, '/');

    for (const [pattern, componentConfig] of Object.entries(config.components)) {
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
