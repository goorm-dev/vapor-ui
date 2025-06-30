import type { StyleRule } from '@vanilla-extract/css';
import { globalLayer, style } from '@vanilla-extract/css';

/**
 * The order of the declaration means the priority of the layer.
 *
 * ---
 *
 * USAGE WITH TAILWIND CSS:
 * To ensure a predictable style cascade when this design system is used with Tailwind CSS,
 * a unified layer order must be explicitly declared in your application's global CSS file
 * (e.g., `src/index.css` or `src/app.css`). This declaration must come before any
 * `@import` or `@tailwind` directives.
 *
 * Example for your global CSS file:
 *
 * @layer vapor-theme, theme, vapor-reset, base, vapor-component, components, vapor-utilities, utilities;
 *
 */
const theme = globalLayer('vapor-theme');
const reset = globalLayer('vapor-reset');
const component = globalLayer('vapor-component');
const utilities = globalLayer('vapor-utilities');

const layerMap = { reset, theme, component, utilities };

export const layerStyle = (
    layer: 'theme' | 'reset' | 'component' | 'utilities',
    rule: StyleRule,
    debugId?: string,
) =>
    style(
        {
            '@layer': {
                [layerMap[layer]]: rule,
            },
        },
        debugId,
    );

export const layers = { theme, reset, component, utilities };
