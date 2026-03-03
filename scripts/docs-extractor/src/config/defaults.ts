import type { ExtractorConfig } from '~/config/schema';

export const defaultExtractorConfig: ExtractorConfig = {
    inputPath: '../../packages/core',
    tsconfig: '../../packages/core/tsconfig.json',
    exclude: [],
    excludeDefaults: true,
    outputDir: '../../apps/website/public/components/generated',
    languages: ['en'],
    filterExternal: true,
    filterHtml: true,
    filterSprinkles: true,
    includeHtml: ['className'],
    components: {},
};
