import type {
    HueAnchors,
    PaletteChip,
    PrimitivePalette,
    ThemeOptions,
    ThemeResult,
} from '../../domain';
import { hexToOklch, pyMod } from '../../domain/color-math';
import type { Mode } from '../../domain/models/scale';
import { COLOR_SCALES } from '../../domain/models/scale';
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

/** Below this OKLCH chroma a HEX has no reliable hue to build a palette from. */
const MIN_KEY_CHROMA = 0.005;

/** `hexcode` as raw HEX; throws when it is too grey to carry a hue. */
const keyHex = (name: string, hexcode: string) => {
    const hex = toRawHex(hexcode);
    if (hexToOklch(hex)[1] < MIN_KEY_CHROMA)
        throw new Error(`Color ${name} is too grey to take a hue from: ${hexcode}`);
    return hex;
};

/**
 * Checks one palette's `hueOverrides` row: the palette must exist (own key only, so
 * `constructor` is unknown), steps must be 050–900, hues finite. Returns the hues wrapped into
 * 0–360.
 */
const checkOverrides = (known: object, name: string, given: Record<string, unknown>) => {
    if (!Object.prototype.hasOwnProperty.call(known, name))
        throw new Error(`Unknown palette for hue overrides: ${name}`);
    return Object.fromEntries(
        Object.entries(given).map(([s, hue]) => {
            if (!(COLOR_SCALES as readonly string[]).includes(s))
                throw new Error(
                    `Invalid hue override step for ${name}: ${s} (use ${COLOR_SCALES.join(', ')})`,
                );
            if (typeof hue !== 'number' || !Number.isFinite(hue))
                throw new Error(
                    `Hue override ${name}-${s} must be a finite number: ${String(hue)}`,
                );
            return [s, pyMod(hue, 360)];
        }),
    );
};

/**
 * Builds the primitive palettes of both modes: the 11 base colors, `basicColors`, the brand
 * color, and `gray`, all against the fixed backgrounds (light `#FFFFFF`, dark `#232323`).
 */
export function generatePrimitiveColorPalette(options: ThemeOptions = {}): ThemeResult {
    const { basicColors = [], brandColor, hueOverrides = {} } = options;
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

    for (const { name, hexcode } of basicColors) {
        const key = claim(name);
        anchors[key] = anchorsFromHex(key, keyHex(key, hexcode), baseHues);
    }

    let brand: { name: string; hex: string } | undefined;
    if (brandColor) {
        const key = claim(brandColor.name);
        brand = { name: key, hex: keyHex(key, brandColor.hexcode) };
        anchors[key] = anchorsFromHex(key, brand.hex, baseHues);
    }

    // Order: anchors → curve → single-step overrides. `anchors` has no gray row.
    const hues: HueTable = Object.fromEntries(
        Object.entries(anchors).map(([name, a]) => [name, anchorHues(a)]),
    );
    const overrides = Object.fromEntries(
        Object.entries(hueOverrides).map(([name, row]) => [name, checkOverrides(hues, name, row)]),
    );
    // The pinned brand cell ignores its override: find that cell on the curve before overrides.
    if (brand && overrides[brand.name]) {
        const { brandScale } = generateFromHues({ [brand.name]: hues[brand.name] }, { brand });
        delete overrides[brand.name][brandScale!];
    }
    for (const [name, row] of Object.entries(overrides)) hues[name] = { ...hues[name], ...row };

    const { light, dark, brandScale, yellow } = generateFromHues(hues, { brand });
    const gray = generateGray();
    const tokens = (mode: Mode, raw: RawPalette) => ({
        palettes: toPalettes({ ...raw, gray: gray[mode] }),
    });

    return {
        lightModeTokens: tokens('light', light),
        darkModeTokens: tokens('dark', dark),
        baseTokens: BASE_TOKENS,
        ...(brand && brandScale && { brand: { name: brand.name, scale: brandScale } }),
        yellowFamily: Array.from(yellow),
    };
}
