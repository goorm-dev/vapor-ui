import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true, // 전역 describe, it 사용 허용 (하지만 코드 내 할당이 더 확실함)
        environment: 'node',
    },

    resolve: {
        alias: {
            '~': path.resolve(__dirname, 'src'),
        },
    },
});
