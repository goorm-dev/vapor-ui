import { defineConfig } from 'tsup';

export default defineConfig({
    entry: {
        index: 'src/index.ts',
        unplugin: 'src/webpack/unplugin-entry.ts',
        'turbopack-loader': 'src/turbopack/turbopack-loader.ts',
        next: 'src/turbopack/next.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    sourcemap: true,
    target: 'node18',
    outExtension({ format }) {
        return { js: format === 'cjs' ? '.cjs' : '.js' };
    },
});
