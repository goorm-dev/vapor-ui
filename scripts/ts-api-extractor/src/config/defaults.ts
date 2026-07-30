import path from 'node:path';

import type { ExtractorConfig } from '~/config/schema';

const CORE_PATH = path.resolve(__dirname, '../../../packages/core');
const CORE_TSCONFIG_PATH = path.resolve(CORE_PATH, 'tsconfig.json');
const OUTPUT_DIR = path.resolve(__dirname, '../../../apps/website/public/components/generated');

/**
 * Default extractor configuration.
 *
 * NOTE: Relative paths (inputPath, tsconfig, outputDir) are resolved against
 * `process.cwd()` at runtime. This configuration assumes the tool is invoked
 * from the repository root. For other invocation contexts, provide an explicit
 * config file (e.g. docs-extractor.config.mjs) with paths relative to that file.
 */
export const defaultExtractorConfig: ExtractorConfig = {
    inputPath: CORE_PATH,
    tsconfig: CORE_TSCONFIG_PATH,
    exclude: [],
    excludeDefaults: true,
    outputDir: OUTPUT_DIR,
    filterExternal: true,
    filterHtml: true,
    filterSprinkles: true,
    includeHtml: ['className'],
    components: {},
    all: false,
    verbose: false,
};
