import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts', 'src/unplugin-entry.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    sourcemap: true,
    target: 'node18',
    outExtension({ format }) {
        return { js: format === 'cjs' ? '.cjs' : '.js' };
    },
});
