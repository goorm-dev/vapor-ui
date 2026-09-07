import type { RolldownPlugin } from 'rolldown';
import { dts as dtsPlugin } from 'rolldown-plugin-dts';
import type { Options } from 'rolldown-plugin-dts';

export const dts = ({ compilerOptions, ...options }: Options = {}): RolldownPlugin[] =>
    dtsPlugin({
        compilerOptions: {
            declaration: true,
            declarationMap: false,
            noEmit: false,
            emitDeclarationOnly: true,
            noEmitOnError: true,
            ...compilerOptions,
        },

        emitDtsOnly: true,
        ...options,
    });
