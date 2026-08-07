import type { RolldownOptions } from 'rolldown';

export const bundle = ({ output, ...options }: RolldownOptions): RolldownOptions => ({
    output: {
        dir: 'dist',
        preserveModules: true,
        preserveModulesRoot: 'src',
        sourcemap: false,
        sourcemapExcludeSources: false,
        ...output,
    },

    ...options,
});
