import { assetFileNames, bundle, generateInputs } from '@repo/rolldown-config';
import { depsExternal, dts } from '@repo/rolldown-config/plugins';
import { vaporRolldownPlugin } from '@vapor-ui/style-macro/rolldown';
import path from 'node:path';
import { defineConfig } from 'rolldown';

/* ----- input ----- */

const inputs = generateInputs([
    'src/index.ts',
    'src/components/**/*.{ts,tsx}',
    '!src/components/**/*.{figma,stories,test,spec}.*',
]);

/**
 * `css()` 를 class 로 바꾸고 모듈마다 `<file>.tsx.vapor.css` 를 import 하게 한다 (ESM `import`,
 * CJS `require`). CSS 위치는 `assetFileNames` 가 소스 옆으로 정하고, `preserveModules` 출력과
 * `sideEffects: ["**\/*.css"]` 덕분에 소비자는 import 한 컴포넌트의 CSS 만 가져간다.
 */
const vapor = () => vaporRolldownPlugin({ hash: true, layer: 'vapor-composites' });

const resolve = {
    alias: { '~': path.resolve('./src') },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
};

export default defineConfig([
    // ESM Build
    bundle({
        input: inputs,
        resolve,
        plugins: [depsExternal(), vapor()],
        output: {
            format: 'esm',
            strict: true,
            exports: 'named',

            entryFileNames: '[name].mjs',
            assetFileNames,
        },
    }),

    // CJS Build
    bundle({
        input: inputs,
        resolve,
        plugins: [depsExternal(), vapor()],
        output: {
            format: 'cjs',
            strict: true,
            exports: 'named',

            entryFileNames: '[name].cjs',
            assetFileNames,
        },
    }),

    // DTS Build
    bundle({
        input: inputs,
        resolve,
        plugins: [depsExternal(), dts()],
        output: {
            entryFileNames: '[name].mts',
        },
    }),

    bundle({
        input: inputs,
        resolve,
        plugins: [depsExternal(), dts()],
        output: {
            entryFileNames: '[name].cts',
        },
    }),
]);
