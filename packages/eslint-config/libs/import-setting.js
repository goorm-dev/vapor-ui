/** @type {Record<string, unknown>} */
export const settings = {
    'import/resolver': {
        // import 경로 해석 설정
        typescript: {
            alwaysTryTypes: true,
            project: [
                // TypeScript import 해석을 위해 참조할 tsconfig.json 파일 경로
                'apps/*/tsconfig.json',
                'packages/*/tsconfig.json',
            ],
        },
    },
};

export default settings;
