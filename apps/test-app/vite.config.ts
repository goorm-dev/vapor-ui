import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vaporStyleMacro from '@vapor-ui/style-macro/unplugin';

export default defineConfig({
    plugins: [vaporStyleMacro.vite(), react()],
});
