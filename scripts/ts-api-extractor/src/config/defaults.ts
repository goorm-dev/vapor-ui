import type { ExtractorConfig } from '~/config/schema';

/**
 * Default extractor configuration.
 *
 * NOTE: Relative paths (inputPath, tsconfig, outputDir) are resolved against
 * `process.cwd()` at runtime. This configuration assumes the tool is invoked
 * from the repository root. For other invocation contexts, provide an explicit
 * config file (e.g. docs-extractor.config.mjs) with paths relative to that file.
 */
export const defaultExtractorConfig: ExtractorConfig = {
    inputPath: '../../packages/core',
    tsconfig: '../../packages/core/tsconfig.json',
    exclude: [],
    excludeDefaults: true,
    outputDir: '../../apps/website/public/components/generated',
    filterExternal: true,
    filterHtml: true,
    filterSprinkles: true,
    includeHtml: ['className'],
    components: {},
};
