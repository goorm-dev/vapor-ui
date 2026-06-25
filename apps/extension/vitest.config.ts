import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing';

// WxtVitest injects WXT's path aliases (~/*, @/*) and globals so tests
// resolve cross-dir imports the same way the build does.
export default defineConfig({
    plugins: [WxtVitest()],
});
