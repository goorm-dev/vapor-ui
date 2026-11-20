import type { Hexcode, KeyColor } from './color';
import type { PaletteChip, PrimitiveColorTokens } from './palette';
import type { Scale } from './scale';

/**
 * Options of `generatePrimitiveColorPalette`.
 */
export interface ThemeOptions {
    /**
     * Extra colors, or replacements for a base color of the same name. One HEX derives key
     * colors from the nearest base color; three HEX are the key colors as-is. The HEX only
     * shapes the hue curve, so it may not appear in the palette.
     */
    basicColors?: Record<string, Hexcode | [Hexcode, Hexcode, Hexcode]>;
    /** Pinned into one light cell as-is; the rest of its palette follows from it. */
    brandColor?: KeyColor;
}

/**
 * Palettes for both modes.
 */
export interface ThemeResult {
    lightModeTokens: PrimitiveColorTokens;
    darkModeTokens: PrimitiveColorTokens;
    /** `color-white`, `color-black` */
    baseTokens: Record<string, PaletteChip>;
    /** The light cell holding the brand HEX. */
    brand?: { name: string; scale: Scale };
}

/**
 * Semantic token name → primitive token name.
 */
export interface SemanticTokens {
    'color-background-primary-100': string;
    'color-background-primary-200': string;
    'color-border-primary': string;
    'color-border-normal': string;
    'color-foreground-primary-100': string;
    'color-foreground-primary-200': string;
    'color-background-canvas-100': string;
    'color-background-canvas-200': string;
    'color-background-overlay-100': string;
    'color-foreground-inverse': string;
    /** Provisional name: text and icons on the primary fill. */
    'color-foreground-onPrimary': string;
}

export interface SemanticResult {
    lightModeTokens: SemanticTokens;
    darkModeTokens: SemanticTokens;
}

export interface PaletteCheck {
    id: 'hue-gap' | 'target-contrast' | 'a11y' | 'chroma' | 'brand-monotone' | 'primary-anchor';
    status: 'ok' | 'warn' | 'fail';
    details: string[];
}
