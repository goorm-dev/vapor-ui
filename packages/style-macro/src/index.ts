import next from './adapters/next';
import rolldown from './adapters/rolldown';
import vite from './adapters/vite';
import webpack from './adapters/webpack';

export type { VaporStyleOptions } from './adapters/unplugin';
export type { NextMode, WithVaporStyleOptions } from './adapters/next';
export type { NestedKey, StyleObject } from './types';
export { css } from './css';
export { _mergeStyle } from './helpers/merge-style';
export { _resolveToken } from './helpers/resolve-token';

const plugins = {
    vite,
    webpack,
    rolldown,
    next,
};

export default plugins;
