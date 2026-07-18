import esbuild from './adapters/esbuild';
import farm from './adapters/farm';
import next from './adapters/next';
import rolldown from './adapters/rolldown';
import rollup from './adapters/rollup';
import rspack from './adapters/rspack';
import vite from './adapters/vite';
import webpack from './adapters/webpack';

export type { VaporStyleOptions } from './adapters/unplugin';
export type { NextMode, WithVaporStyleOptions } from './adapters/next';

const plugins = {
    vite,
    rollup,
    webpack,
    rspack,
    esbuild,
    farm,
    rolldown,
    next,
};

export default plugins;
