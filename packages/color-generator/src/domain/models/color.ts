/**
 * HEX color code, `#RRGGBB` or `#RGB`.
 */
export type Hexcode = string;

/**
 * A named color input.
 */
export interface KeyColor {
    name: string;
    hexcode: Hexcode;
}
