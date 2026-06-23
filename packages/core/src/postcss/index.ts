import type { Plugin } from 'postcss';

import { resolveBreakpoints } from './breakpoints';
import type { BreakpointName, BreakpointOverrides } from './breakpoints';

export function vaporCustomMedia(overrides: BreakpointOverrides = {}): Plugin {
    const resolved = resolveBreakpoints(overrides);
    const pattern = /\(--vapor-(sm|md|lg)\)/g;

    return {
        postcssPlugin: 'vapor-custom-media',
        AtRule(atRule) {
            if (atRule.name !== 'media') return;
            atRule.params = atRule.params.replace(
                pattern,
                (_match, name: BreakpointName) => resolved[name],
            );
        },
    };
}

(vaporCustomMedia as unknown as { postcss: true }).postcss = true;

export default vaporCustomMedia;
export type { BreakpointOverrides };
