import type { ExtractorConfig } from './schema';

export const DEFAULT_CONFIG: ExtractorConfig = {
    global: {
        exclude: [],
        excludeDefaults: true,
        outputDir: './output',
        languages: ['ko'],
        defaultLanguage: 'ko',
        filterExternal: true,
        filterHtml: true,
        filterSprinkles: true,
    },
    components: {},
};

export const CONFIG_FILE_NAMES = [
    'docs-extractor.config.ts',
    'docs-extractor.config.js',
    'docs-extractor.config.mjs',
];
