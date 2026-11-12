import unplugin from './_factory';
import type { VaporPluginOptions } from './_options';

export type { VaporPluginOptions };

/**
 * Rolldown plugin for @vapor-ui/style-macro — JS 변환만 담당한다.
 * CSS 는 PostCSS 에 `@vapor-ui/style-macro/postcss` 를 등록해 `@vapor-utilities;`
 * 자리에서 수집한다.
 *
 *     // rolldown.config.js
 *     import vaporStyle from '@vapor-ui/style-macro/rolldown';
 *     export default { plugins: [vaporStyle()] };
 */
export function vaporRolldownPlugin(opts?: VaporPluginOptions) {
    return unplugin.rolldown(opts);
}
