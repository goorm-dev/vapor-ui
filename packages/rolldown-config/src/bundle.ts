import type { RolldownOptions } from 'rolldown';

export const bundle = ({ output: outputOptions, ...options }: RolldownOptions): RolldownOptions => {
    const output = Array.isArray(outputOptions) ? outputOptions : [outputOptions];

    return {
        output: output.map((options) => ({
            dir: 'dist',
            preserveModules: true,
            preserveModulesRoot: 'src',
            sourcemap: false,
            sourcemapExcludeSources: false,
            ...options,
        })),

        ...options,
    };
};
