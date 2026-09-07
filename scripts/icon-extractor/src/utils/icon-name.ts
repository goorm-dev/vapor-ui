import { camelCase, startCase } from 'lodash-es';

/** Some Figma layers carry a ❤️ marker in front of the name. */
const FIGMA_EMOJI_PREFIX_PATTERN = /❤️\s*/g;

/**
 * Figma layer name → component name, e.g. `❤️ arrow-right` → `ArrowRight`.
 * Component folders and parity baseline files both key on this, so there is exactly one copy.
 */
const normalizeIconName = (name: string) =>
    startCase(camelCase(name.replace(FIGMA_EMOJI_PREFIX_PATTERN, ''))).replace(/ /g, '');

export { normalizeIconName };
