import type { ExtractorConfig } from '~/config/schema';

const CORE_PATH = 'packages/core';
const CORE_TSCONFIG_PATH = 'packages/core/tsconfig.json';
const OUTPUT_DIR = 'apps/website/public/components/generated';

/**
 * Default extractor configuration.
 *
 * NOTE: Relative paths (inputPath, tsconfig, outputDir) are resolved against
 * `process.cwd()` at runtime. This configuration assumes the tool is invoked
 * from the repository root. For other invocation contexts, provide an explicit
 * config file (e.g. docs-extractor.config.mjs) with paths relative to that file.
 *
 * TODO: *path 필드는 사용처에서 반드시 전달하도록 기본값 제거. 사용처에 따라 달라질 수 있으며, 상대경로로 지정되어 있어 working directory에 따라 달라질 수 있음.
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
