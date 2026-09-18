import type { ExtractorDefaults } from '~/domain/config/schema';

/**
 * Behavioral defaults only.
 *
 * Path fields (`inputPath`, `tsconfig`, `outputDir`) have no default: they depend
 * entirely on the invocation context and were previously resolved against
 * `__dirname`, which is undefined in the ESM bundle. Callers must supply them
 * through a config file (e.g. docs-extractor.config.mjs), with paths relative to
 * the current working directory.
 */
export const defaultExtractorConfig: ExtractorDefaults = {
    exclude: [],
    excludeDefaults: true,
    filterExternal: true,
    filterHtml: true,
    filterSprinkles: true,
    includeHtml: ['className'],
    components: {},
    verbose: false,
};
