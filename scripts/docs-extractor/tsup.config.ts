import path from 'node:path';
import { defineConfig } from 'tsup';

export default defineConfig([
    // Library build: apps/website/docs-extractor.config.js에서 defineConfig를 import하기 위해 필요
    {
        name: 'LIB', // 빌드 로그 구분용 레이블
        format: ['esm'],
        sourcemap: true,
        splitting: false,
        target: 'node18', // package.json의 engines와 일치
        esbuildOptions(options) {
            options.alias = {
                '~': path.resolve(__dirname, './src'),
            };
        },
        entry: ['src/index.ts'],
        dts: true, // TypeScript 타입 정의 생성
        outDir: 'dist',
    },
    // CLI build: ts-api-extractor 실행 파일
    {
        name: 'CLI', // 빌드 로그 구분용 레이블
        format: ['esm'],
        sourcemap: true,
        splitting: false,
        target: 'node18', // package.json의 engines와 일치
        esbuildOptions(options) {
            options.alias = {
                '~': path.resolve(__dirname, './src'),
            };
        },
        entry: ['src/bin/cli.ts'],
        dts: false, // CLI는 타입 정의 불필요
        outDir: 'dist/bin',
        banner: {
            js: '#!/usr/bin/env node', // CLI 실행 파일 헤더
        },
    },
]);
