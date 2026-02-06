import { defineConfig } from '@vapor-ui/ts-api-extractor';

export default defineConfig({
    global: {
        outputDir: './public/components/generated',
        languages: ['ko', 'en'],
        defaultLanguage: 'ko',
        filterExternal: true,
        filterSprinkles: true,
        filterHtml: true,
        includeHtml: ['className', 'style'],
    },

    sprinkles: {
        metaPath: '../../scripts/docs-extractor/generated/sprinkles-meta.json',
        include: ['padding', 'paddingX', 'paddingY', 'margin', 'gap', 'color'],
    },

    components: {
        'box/box.tsx': {
            sprinklesAll: true,
        },
        'flex/flex.tsx': {
            sprinkles: ['gap', 'alignItems', 'justifyContent', 'flexDirection', 'alignContent'],
        },
        'v-stack/v-stack.tsx': {
            sprinkles: ['gap', 'alignItems', 'justifyContent'],
        },
        'h-stack/h-stack.tsx': {
            sprinkles: ['gap', 'alignItems', 'justifyContent'],
        },
    },
});
