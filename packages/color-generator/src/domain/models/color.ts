/**
 * HEX color code, `#RRGGBB` or `#RGB`.
 */
export type Hexcode = string;

/**
 * A named color input.
 */
export interface KeyColor {
    /** Palette name; lowercased, so `Acme` and `acme` are the same palette. */
    name: string;
    hexcode: Hexcode;
}
