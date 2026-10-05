import { camelCase, startCase } from 'lodash-es';

/** Some Figma layers carry a ❤️ marker in front of the name. */
const FIGMA_EMOJI_PREFIX_PATTERN = /❤️\s*/g;

/**
 * Figma layer name → component name, e.g. `❤️ arrow-right` → `ArrowRight`.
 * Component folders and parity baseline files both key on this, so there is exactly one copy.
 */
const normalizeIconName = (name: string) => {
    const normalized = startCase(camelCase(name.replace(FIGMA_EMOJI_PREFIX_PATTERN, ''))).replace(
        / /g,
        '',
    );
    // The result lands in `const <name>` and `export ... as <name>`, so an empty or digit-leading
    // name emits TypeScript that will not parse. Reserved words cannot occur: they are all
    // lowercase and this is always PascalCase.
    if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(normalized)) {
        throw new Error(`Figma layer name is not a valid component name: "${name}"`);
    }
    return normalized;
};

export { normalizeIconName };
