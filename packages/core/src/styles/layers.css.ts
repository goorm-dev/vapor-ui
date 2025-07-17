import { globalLayer } from '@vanilla-extract/css';

export const layerName = {
    theme: 'vapor-theme',
    reset: 'vapor-reset',
    component: 'vapor-component',
    utilities: 'vapor-utilities',
} as const;

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

const theme = globalLayer(layerName.theme);
const reset = globalLayer(layerName.reset);
const component = globalLayer(layerName.component);
const utilities = globalLayer(layerName.utilities);

export const layers = { theme, reset, component, utilities };
