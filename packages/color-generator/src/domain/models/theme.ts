import type { KeyColor } from './color';
import type { PaletteChip, PrimitiveColorTokens } from './palette';
import type { AnchorScale, Scale } from './scale';

/**
 * Palette name (lowercase, brand name included) → scale → absolute light-mode OKLCH hue in
 * degrees.
 */
export type HueOverrides = Record<string, Partial<Record<Scale, number>>>;

/** Light-mode OKLCH hue in degrees at the three steps that anchor a color's hue curve. */
export type HueAnchors = Record<AnchorScale, number>;

/**
 * Options of `generatePrimitiveColorPalette`.
 */
export interface ThemeOptions {
    /**
     * Extra colors, or replacements for a base color of the same name. The HEX picks the base
     * color whose 500 hue is nearest and shifts its hue anchors by the hue difference. The HEX
     * only shapes the hue curve, so it may not appear in the palette.
     */
    basicColors?: KeyColor[];
    /** Pinned into one light cell as-is; the rest of its palette follows from it. */
    brandColor?: KeyColor;
    /**
     * Palette name (lowercase, brand name included) → hue anchors replacing the default or
     * HEX-derived ones; missing anchors keep theirs, and every step follows the curve through
     * the three, before `hueOverrides`. An unknown name, `gray`, an anchor key other than `050`,
     * `600`, `900`, or a non-finite hue throws. Hues wrap, so -10 means 350.
     */
    hueAnchors?: Record<string, Partial<HueAnchors>>;
    /**
     * Light hues of single steps, applied over the anchor curve. Each overridden cell keeps its
     * contrast target and chroma rule, and dark follows from the overridden light curve. The
     * pinned brand cell ignores its override. An unknown name, `gray`, a step outside 050–900,
     * or a non-finite hue throws. Hues wrap, so 444 means 84.
     */
    hueOverrides?: HueOverrides;
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
    /**
     * Palettes the engine capped as yellow family, read off its hue table. `validatePalette`
     * falls back to each palette's light 200 hue when this is absent.
     */
    yellowFamily?: string[];
    /**
     * Palette name → the hue anchors its light curve was built from: the default or HEX-derived
     * ones with `hueAnchors` applied, wrapped into 0–360 (no gray row). Passing them back as
     * `hueAnchors` with the same colors rebuilds the same palettes.
     */
    hueAnchors?: Record<string, HueAnchors>;
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
