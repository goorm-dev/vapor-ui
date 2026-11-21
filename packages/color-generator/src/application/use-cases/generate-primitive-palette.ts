import type { PaletteChip, PrimitivePalette, ThemeOptions, ThemeResult } from '../../domain';
import { hexToOklch } from '../../domain/color-math';
import type { Mode } from '../../domain/models/scale';
import { BASE_TOKENS } from '../constants';
import type { HueTable } from '../engine/hue';
import { keysFromHex, leonardoHues } from '../engine/hue';
import type { RawPalette } from '../engine/palette';
import { generateFromHues, generateGray, getBaseHueTable } from '../engine/palette';
import { isValidColorName, toRawHex } from '../utils';

const round2 = (v: number) => Math.round(v * 100) / 100;

const toChip = (color: string, scale: string, raw: string): PaletteChip => {
    const [L, C, H] = hexToOklch(raw);
    // Achromatic cells carry a meaningless hue; print 0 as before.
    const hue = round2(C) === 0 ? 0 : round2(H);
    return {
        name: `color-${color}-${scale}`,
        hex: `#${raw.toLowerCase()}`,
        oklch: `oklch(${round2(L)} ${round2(C)} ${hue})`,
        codeSyntax: `vapor-color-${color}-${scale}`,
    };
};

const toPalettes = (raw: RawPalette): PrimitivePalette[] =>
    Object.entries(raw).map(([name, row]) => ({
        name,
        chips: Object.fromEntries(
            Object.entries(row).map(([s, hex]) => [s, toChip(name, s, hex!)]),
        ),
    }));

const checkName = (name: string) => {
    if (!isValidColorName(name) || name === 'gray') throw new Error(`Invalid color name: ${name}`);
};

/**
 * Builds the primitive palettes of both modes: the 11 base colors, `basicColors`, the brand
 * color, and `gray`, all against the fixed backgrounds (light `#FFFFFF`, dark `#232323`).
 */
export function generatePrimitiveColorPalette(options: ThemeOptions = {}): ThemeResult {
    const { basicColors = [], brandColor } = options;
    const baseHues = getBaseHueTable();
    const hues: HueTable = { ...baseHues };
    const seen = new Set<string>();
    const claim = (name: string) => {
        checkName(name);
        if (seen.has(name)) throw new Error(`Duplicate color name: ${name}`);
        seen.add(name);
    };

    for (const { name, hexcode } of basicColors) {
        claim(name);
        hues[name] = leonardoHues(keysFromHex(toRawHex(hexcode), baseHues));
    }

    let brand: { name: string; hex: string } | undefined;
    if (brandColor) {
        claim(brandColor.name);
        brand = { name: brandColor.name, hex: toRawHex(brandColor.hexcode) };
        hues[brand.name] = leonardoHues(keysFromHex(brand.hex, baseHues));
    }

    const { light, dark, brandScale } = generateFromHues(hues, { brand });
    const gray = generateGray();
    const tokens = (mode: Mode, raw: RawPalette) => ({
        palettes: toPalettes({ ...raw, gray: gray[mode] }),
    });

    return {
        lightModeTokens: tokens('light', light),
        darkModeTokens: tokens('dark', dark),
        baseTokens: BASE_TOKENS,
        ...(brand && brandScale && { brand: { name: brand.name, scale: brandScale } }),
    };
}
