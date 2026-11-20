import type { PrimitivePalette, SemanticResult, SemanticTokens, ThemeResult } from '../../domain';
import { contrast } from '../../domain/color-math';
import type { ColorScale, Mode, Scale } from '../../domain/models/scale';
import { COLOR_SCALES } from '../../domain/models/scale';
import { assignCell } from '../engine/brand';

const findPalette = (result: ThemeResult, mode: Mode, name: string) => {
    const palette = (
        mode === 'light' ? result.lightModeTokens : result.darkModeTokens
    ).palettes.find((p) => p.name === name);
    if (!palette) throw new Error(`Palette '${name}' not found in theme result`);
    return palette;
};

/** Engine HEX form (`RRGGBB`) of a chip. */
export const rawHex = (palette: PrimitivePalette, scale: Scale) =>
    palette.chips[scale].hex.slice(1).toUpperCase();

export const rawRow = (palette: PrimitivePalette) =>
    Object.fromEntries(Object.keys(palette.chips).map((s) => [s, rawHex(palette, s as Scale)]));

/**
 * The primary palette's anchor scale per mode. Light is the brand cell (500 without a brand).
 * Dark runs the same cell assignment on the dark palette with the brand HEX, which is never
 * pinned in dark (400 without a brand).
 */
export const primaryAnchor = (result: ThemeResult, primary: string): Record<Mode, ColorScale> => {
    if (result.brand?.name !== primary) return { light: '500', dark: '400' };
    const light = result.brand.scale as ColorScale;
    const brandHex = rawHex(findPalette(result, 'light', primary), light);
    const dark =
        assignCell(brandHex, 'dark', rawRow(findPalette(result, 'dark', primary))) ?? '400';
    return { light, dark };
};

const step = (scale: ColorScale, by: number) =>
    COLOR_SCALES[Math.min(COLOR_SCALES.indexOf(scale) + by, 9)];

const GRAY: Record<Mode, Record<'canvas100' | 'overlay100' | 'borderNormal', Scale>> = {
    light: { canvas100: '000', overlay100: '000', borderNormal: '100' },
    dark: { canvas100: '025', overlay100: '050', borderNormal: '300' },
};

const tokensFor = (
    result: ThemeResult,
    mode: Mode,
    primary: string,
    anchor: ColorScale,
): SemanticTokens => {
    const palette = findPalette(result, mode, primary);
    const p = (s: Scale) => `color-${primary}-${s}`;
    const gray = (s: Scale) => `color-gray-${s}`;
    const white = result.baseTokens['color-white'].name;
    const black = result.baseTokens['color-black'].name;
    return {
        'color-background-primary-100': p(mode === 'light' ? '100' : '050'),
        'color-background-primary-200': p(anchor),
        'color-border-primary': p(anchor),
        'color-border-normal': gray(GRAY[mode].borderNormal),
        'color-foreground-primary-100': p(step(anchor, 1)),
        'color-foreground-primary-200': p(step(anchor, 2)),
        'color-background-canvas-100': gray(GRAY[mode].canvas100),
        'color-background-canvas-200': gray('050'),
        'color-background-overlay-100': gray(GRAY[mode].overlay100),
        'color-foreground-inverse': mode === 'light' ? white : black,
        'color-foreground-onPrimary':
            contrast('FFFFFF', rawHex(palette, anchor)) >= 4.5 ? white : black,
    };
};

/**
 * Maps the primitive palettes to semantic tokens. Values are primitive token names.
 */
export function getSemanticDependentTokens(
    themeResult: ThemeResult,
    primaryColorName = 'blue',
): SemanticResult {
    const anchor = primaryAnchor(themeResult, primaryColorName);
    return {
        lightModeTokens: tokensFor(themeResult, 'light', primaryColorName, anchor.light),
        darkModeTokens: tokensFor(themeResult, 'dark', primaryColorName, anchor.dark),
    };
}
