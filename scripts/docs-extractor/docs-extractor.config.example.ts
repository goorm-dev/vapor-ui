import { defineConfig } from './src/config';

export default defineConfig({
    global: {
        // 상대 경로 사용: 이 설정 파일은 scripts/docs-extractor/ 에서 실행되므로
        // apps/website/public/... 에 도달하려면 두 단계 상위로 이동 필요
        outputDir: '../../apps/website/public/components/generated',
        languages: ['ko', 'en'],
        defaultLanguage: 'en',
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
