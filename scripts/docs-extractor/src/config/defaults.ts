import type { ExtractorConfig } from './schema';

export const DEFAULT_CONFIG: ExtractorConfig = {
    global: {
        outputDir: './output',
        languages: ['ko'],
        defaultLanguage: 'ko',
        filterExternal: true,
        filterSprinkles: true,
        filterHtml: true,
    },
    sprinkles: {
        metaPath: './generated/sprinkles-meta.json',
    },
    components: {},
};

export const CONFIG_FILE_NAMES = [
    'docs-extractor.config.ts',
    'docs-extractor.config.js',
    'docs-extractor.config.mjs',
];
