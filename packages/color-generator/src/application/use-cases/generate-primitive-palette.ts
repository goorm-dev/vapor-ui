import type {
    HueAnchors,
    PaletteChip,
    PrimitivePalette,
    ThemeOptions,
    ThemeResult,
} from '../../domain';
import { hexToOklch } from '../../domain/color-math';
import type { Mode } from '../../domain/models/scale';
import { ANCHOR_SCALES } from '../../domain/models/scale';
import { BASE_TOKENS, HUE_ANCHORS } from '../constants';
import type { HueTable } from '../engine/hue';
import { anchorHues, anchorsFromHex } from '../engine/hue';
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

const checkAnchors = (name: string, given: Record<string, unknown>) => {
    for (const [s, hue] of Object.entries(given)) {
        if (!(ANCHOR_SCALES as readonly string[]).includes(s))
            throw new Error(`Invalid hue anchor step for ${name}: ${s} (use 050, 600 or 900)`);
        if (typeof hue !== 'number' || !Number.isFinite(hue))
            throw new Error(`Hue anchor ${name}-${s} must be a finite number: ${String(hue)}`);
    }
};

/**
 * Builds the primitive palettes of both modes: the 11 base colors, `basicColors`, the brand
 * color, and `gray`, all against the fixed backgrounds (light `#FFFFFF`, dark `#232323`).
 */
export function generatePrimitiveColorPalette(options: ThemeOptions = {}): ThemeResult {
    const { basicColors = [], brandColor, hueAnchors = {}, hueOverrides = {} } = options;
    const baseHues = getBaseHueTable();
    const anchors: Record<string, HueAnchors> = { ...HUE_ANCHORS };
    const seen = new Set<string>();
    /** Lowercases `input`, then rejects `gray`, invalid names and repeats. */
    const claim = (input: string) => {
        const name = input.toLowerCase();
        checkName(name);
        if (seen.has(name)) throw new Error(`Duplicate color name: ${name}`);
        seen.add(name);
        return name;
    };

    for (const { name, hexcode } of basicColors)
        anchors[claim(name)] = anchorsFromHex(toRawHex(hexcode), baseHues);

    let brand: { name: string; hex: string } | undefined;
    if (brandColor) {
        brand = { name: claim(brandColor.name), hex: toRawHex(brandColor.hexcode) };
        anchors[brand.name] = anchorsFromHex(brand.hex, baseHues);
    }

    // Order: anchors → curve → single-step overrides. `anchors` has no gray row.
    for (const [name, given] of Object.entries(hueAnchors)) {
        if (!anchors[name]) throw new Error(`Unknown palette for hue anchors: ${name}`);
        checkAnchors(name, given);
        anchors[name] = { ...anchors[name], ...given };
    }
    const hues: HueTable = Object.fromEntries(
        Object.entries(anchors).map(([name, a]) => [name, anchorHues(a)]),
    );
    for (const [name, row] of Object.entries(hueOverrides))
        if (hues[name]) hues[name] = { ...hues[name], ...row };

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
