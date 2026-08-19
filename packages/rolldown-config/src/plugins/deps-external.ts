import type { RolldownPlugin } from 'rolldown';
import depsExternalPlugin from 'rollup-plugin-node-externals';
import type { ExternalsOptions } from 'rollup-plugin-node-externals';

export const depsExternal = (options?: ExternalsOptions): RolldownPlugin =>
    depsExternalPlugin(options) as RolldownPlugin;
