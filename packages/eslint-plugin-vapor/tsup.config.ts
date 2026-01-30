import { defineConfig } from 'tsup';

export default [
    defineConfig({
        entry: ['src/index.ts'],
        format: ['cjs', 'esm'],
        dts: false, // 타입 정의(.d.ts) 파일 생성
        clean: true, // 빌드 전 dist 폴더 정리
        minify: true,
        splitting: false, // 플러그인은 단일 파일로 배포하는 것이 안정적임
    }),

    defineConfig({
        entry: ['src/index.ts'],
        format: ['esm'],
        dts: { only: true },
    }),
];
