import { defineConfig } from '@vapor-ui/ts-api-extractor';

export default defineConfig({
    inputPath: '../../packages/core',
    tsconfig: '../../packages/core/tsconfig.json',
    outputDir: './public/components/generated',
    filterExternal: true,
    filterHtml: true,
    filterSprinkles: true,
    includeHtml: ['className'],
    components: {
        'button/button.tsx': {
            // base-ui prop. render로 button 이외의 태그를 넘길 때 반드시 함께 지정해야 하므로
            // filterExternal 예외로 표에 노출한다.
            include: ['nativeButton'],
        },
    },
});
