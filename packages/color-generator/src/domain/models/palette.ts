import type { Hexcode } from './color';

/**
 * One palette cell.
 */
export interface PaletteChip {
    /** Token name, e.g. `color-blue-500` */
    name: string;
    /** `#rrggbb` */
    hex: Hexcode;
    /** `oklch(L C H)`, each value rounded to 2 decimals */
    oklch: string;
    /** CSS variable name without `--`, e.g. `vapor-color-blue-500` */
    codeSyntax: string;
}

/**
 * Every scale of one color. Colors have 050–900; gray has 000–900.
 */
export interface PrimitivePalette {
    name: string;
    chips: Record<string, PaletteChip>;
}

/**
 * Palettes of one mode: base colors, basic colors, brand, then `gray`.
 */
export interface PrimitiveColorTokens {
    palettes: PrimitivePalette[];
}
