import type { ExtractorConfig } from '~/config/schema';

/**
 * Extractor configuration.
 *
 * Relative paths (inputPath, tsconfig, outputDir) are resolved against
 * `process.cwd()`, which is `apps/website` — that is how
 * `pnpm --filter website extract` invokes the CLI.
 */
export const extractorConfig: ExtractorConfig = {
    inputPath: '../../packages/core',
    tsconfig: '../../packages/core/tsconfig.json',
    exclude: [],
    excludeDefaults: true,
    outputDir: '../../apps/website/public/components/generated',
    filterExternal: true,
    filterHtml: true,
    filterSprinkles: true,
    includeHtml: ['className'],
};
