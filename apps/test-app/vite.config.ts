import vitePlugin from '@vapor-ui/style-macro/unplugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [vitePlugin.vite(), react()],
});
