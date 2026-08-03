import type { ExtractorConfig } from '~/config/schema';

/**
 * Default extractor configuration.
 *
 * NOTE: Relative paths (inputPath, tsconfig, outputDir) are resolved against
 * `process.cwd()`. These defaults assume the tool runs from `apps/website`
 * (that is how `pnpm --filter website extract` invokes it). For other
 * invocation contexts, provide an explicit config file
 * (e.g. docs-extractor.config.mjs) with paths relative to that file.
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
    all: false,
    verbose: false,
};
