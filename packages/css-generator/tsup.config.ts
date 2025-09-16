import { type Options, defineConfig } from 'tsup';

const DIST_DIR = 'dist';

const commonConfig: Options = {
    target: 'es6',
    sourcemap: true,
    minify: false,
    dts: true,
    format: ['esm', 'cjs'],
    outExtension({ format }) {
        return {
            js: format === 'cjs' ? '.cjs' : '.js',
        };
    },
};

export default defineConfig({
    ...commonConfig,
    entry: { index: 'src/index.ts' },
    outDir: DIST_DIR,
    clean: true,
});