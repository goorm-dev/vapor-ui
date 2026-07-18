import unplugin from './unplugin';
import type { VaporStyleOptions } from './unplugin';

export type { VaporStyleOptions };

/**
 * esbuild plugin for @vapor-ui/style-macro.
 *
 *     // esbuild build script
 *     import vaporStyle from '@vapor-ui/style-macro/esbuild';
 *     await esbuild.build({ plugins: [vaporStyle()] });
 */
export default function vaporStyleEsbuild(opts?: VaporStyleOptions) {
    return unplugin.esbuild(opts);
}
