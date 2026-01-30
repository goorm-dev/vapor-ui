import { defineConfig } from './src/config';

export default defineConfig({
    global: {
        outputDir: './apps/website/public/components/generated',
        languages: ['ko', 'en'],
        defaultLanguage: 'ko',
        filterExternal: true,
        filterSprinkles: true,
        filterHtml: true,
        includeHtml: ['className', 'style'],
    },

    sprinkles: {
        metaPath: './generated/sprinkles-meta.json',
        include: ['padding', 'paddingX', 'paddingY', 'margin', 'gap', 'color'],
    },

    components: {
        'box/box.tsx': {
            sprinklesAll: true,
        },
        'flex/flex.tsx': {
            sprinkles: ['gap', 'alignItems', 'justifyContent'],
        },
    },
});
