import { defineConfig } from '@vapor-ui/ts-api-extractor';

export default defineConfig({
    global: {
        outputDir: './public/components/generated',
        languages: ['en'],
        defaultLanguage: 'en',
        filterExternal: true,
        filterHtml: true,
        includeHtml: ['className', 'style'],
    },
});
