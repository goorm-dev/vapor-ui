import { defineConfig } from './src/config';

export default defineConfig({
    global: {
        // tsconfig.json 경로 (미지정 시 소스 경로에서 자동 탐색)
        // tsconfig: './tsconfig.json',

        // 파일 스캔 시 제외할 추가 패턴
        exclude: [],

        // 기본 제외 패턴 적용 여부 (.stories.tsx, .css.ts, .test.tsx)
        excludeDefaults: true,

        // 상대 경로 사용: 이 설정 파일은 scripts/docs-extractor/ 에서 실행되므로
        // apps/website/public/... 에 도달하려면 두 단계 상위로 이동 필요
        outputDir: '../../apps/website/public/components/generated',
        languages: ['ko', 'en'],
        defaultLanguage: 'en',
        filterExternal: true,
        filterHtml: true,
        includeHtml: ['className', 'style'],
    },

    components: {
        // 컴포넌트별 추가 props 포함
        // 'button/button.tsx': {
        //     include: ['customProp'],
        // },
    },
});
