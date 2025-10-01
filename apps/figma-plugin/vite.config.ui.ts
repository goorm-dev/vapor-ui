import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    plugins: [react(), tailwindcss(), ...(mode === 'production' ? [viteSingleFile()] : [])],
    resolve: {
        alias: {
            '~': path.resolve(__dirname, 'src'),
        },
    },
    build: {
        minify: mode === 'production',
        cssMinify: mode === 'production',
        sourcemap: mode !== 'production' ? 'inline' : false,
        emptyOutDir: false,
        outDir: path.resolve('dist'),
        rollupOptions: {
            input: path.resolve('index.html'),
        },
    },
}));
