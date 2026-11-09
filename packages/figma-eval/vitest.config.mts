import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // pnpm's bin shim puts the monorepo's hoisted packages on NODE_PATH, where fromInstalled would find a built
        // @vapor-ui package that a test app does not install.
        env: { NODE_PATH: '' },
    },
});
