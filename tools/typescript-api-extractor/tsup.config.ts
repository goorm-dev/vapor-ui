import { defineConfig } from 'tsup';
import path from 'node:path';

export default defineConfig({
  entry: ['src/index.ts', 'src/cli/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  target: 'node18',
  esbuildOptions(options) {
    options.alias = {
      '~': path.resolve(__dirname, './src'),
    };
  },
});
