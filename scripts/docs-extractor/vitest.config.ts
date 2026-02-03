import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: {
        alias: {
            '~': path.resolve(__dirname, './src'),
        },
    },
    test: {
        globals: true,
        environment: 'node',
        include: ['test/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            // lcov: CI 커버리지 도구(Codecov 등)에서 사용하는 표준 형식
            reporter: ['text', 'json', 'html', 'lcov'],
            include: ['src/**/*.ts'],
            // CLI, I/O 관련 코드는 통합 테스트로 검증하므로 커버리지 측정에서 제외
            // 핵심 로직(config, core, i18n)에 집중
            exclude: [
                'src/index.ts', // re-export만 하는 barrel 파일
                'src/bin/**', // CLI 엔트리포인트
                'src/cli/**', // CLI 옵션 파싱, 인터랙티브 프롬프트
                'src/output/writer.ts', // 파일 시스템 I/O
                'src/types/**', // 타입 정의만 포함
            ],
            // threshold: 코드 품질 게이트 - 이 수준 이하로 떨어지면 CI 실패
            // 새 코드 추가 시 테스트 작성 강제
            thresholds: {
                lines: 70,
                branches: 65,
                functions: 70,
                statements: 70,
            },
        },
    },
});
