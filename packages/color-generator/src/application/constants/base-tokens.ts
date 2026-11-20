import type { PaletteChip } from '../../domain';

/**
 * `color-white` and `color-black`.
 */
export const BASE_TOKENS: Record<string, PaletteChip> = {
    'color-white': {
        name: 'color-white',
        hex: '#FFFFFF',
        oklch: 'oklch(1 0 0)',
        codeSyntax: 'vapor-color-white',
    },
    'color-black': {
        name: 'color-black',
        hex: '#000000',
        oklch: 'oklch(0 0 0)',
        codeSyntax: 'vapor-color-black',
    },
};
