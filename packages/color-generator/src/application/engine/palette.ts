import {
    clampedLuminance,
    gamutChroma,
    hexToOklch,
    luminance,
    oklchToLinRgb,
    pyMod,
    toHex,
} from '../../domain/color-math';
import type { ColorScale, Mode, Scale } from '../../domain/models/scale';
import { COLOR_SCALES, SCALES } from '../../domain/models/scale';
import {
    BASE_COLORS,
    BG,
    CAPPED_SCALES,
    DARK_400_CHROMA_FACTOR,
    EXPRESSIBLE_MAX,
    LEONARDO_KEYS,
    TARGET_CONTRAST,
    YELLOW_FAMILY_RANGE,
    isDarkerThanBg,
} from '../constants/palette-rules';
import { assignCell } from './brand';
import type { HueTable } from './hue';
import { buildHueTable } from './hue';

/** HEX (6 uppercase digits, no `#`) per color per scale. */
export type RawPalette = Record<string, Partial<Record<Scale, string>>>;

/**
 * Lightness whose color hits `target` contrast against `bg`, with `chroma` clipped to sRGB.
 * Returns the HEX, the last L tried, and the chroma applied there.
 */
export const solve = (
    target: number,
    bg: string,
    chroma: number,
    hue: number,
    darkerThanBg: boolean,
) => {
    const yb = luminance(bg);
    const yt = darkerThanBg ? (yb + 0.05) / target - 0.05 : target * (yb + 0.05) - 0.05;
    let lo = 0;
    let hi = 1;
    let L = 0.5;
    for (let i = 0; i < 60; i++) {
        L = (lo + hi) / 2;
        const c = gamutChroma(L, chroma, hue);
        if (clampedLuminance(oklchToLinRgb(L, c, hue)) < yt) lo = L;
        else hi = L;
    }
    const c = gamutChroma(L, chroma, hue);
    return { hex: toHex(oklchToLinRgb(L, c, hue)), L, C: c };
};

export const maxChroma = (target: number, bg: string, hue: number, darkerThanBg: boolean) =>
    solve(target, bg, EXPRESSIBLE_MAX, hue, darkerThanBg).C;

export const inYellowFamily = (hue200: number) =>
    YELLOW_FAMILY_RANGE[0] <= hue200 && hue200 <= YELLOW_FAMILY_RANGE[1];

const chromaOf = (hex: string) => hexToOklch(hex)[1];

/** Shared 050–200 chroma cap for normal and yellow-family colors, from the base colors only. */
type Caps = Record<string, { normal: number; yellow: number }>;

const capsFrom = (
    baseHue: (c: string, s: ColorScale) => number,
    yellow: Set<string>,
    mode: Mode,
): Caps =>
    Object.fromEntries(
        CAPPED_SCALES.map((s) => {
            const mx = BASE_COLORS.map((c) => ({
                c,
                C: maxChroma(TARGET_CONTRAST[mode][s], BG[mode], baseHue(c, s), mode === 'light'),
            }));
            const min = (pick: boolean) =>
                Math.min(...mx.filter((m) => yellow.has(m.c) === pick).map((m) => m.C));
            return [s, { normal: min(false), yellow: min(true) }];
        }),
    );

/** Light 050–900 for one color, before any brand pin. */
const lightColor = (hue: Record<ColorScale, number>, cap: (s: ColorScale) => number) => {
    const out: Partial<Record<Scale, string>> = {};
    const at = (s: ColorScale, chroma: number) =>
        solve(TARGET_CONTRAST.light[s], BG.light, chroma, hue[s], true).hex;
    for (const s of CAPPED_SCALES) out[s] = at(s, cap(s));
    for (const s of COLOR_SCALES.slice(4)) out[s] = at(s, EXPRESSIBLE_MAX);
    out['300'] = at('300', (chromaOf(out['200']!) + chromaOf(out['400']!)) / 2);
    return out;
};

/** Dark 400–900: same-lightness chroma and hue of the final light curve. */
export const darkUpper = (light: Partial<Record<Scale, string>>, scales: ColorScale[]) => {
    const curve = COLOR_SCALES.map((s) => hexToOklch(light[s]!)).sort(
        (p, q) => q[0] - p[0] || q[1] - p[1] || q[2] - p[2],
    );
    const at = (L: number): [number, number] => {
        if (L >= curve[0][0]) return [curve[0][1], curve[0][2]];
        for (let i = 0; i + 1 < curve.length; i++) {
            const [L1, C1, H1] = curve[i];
            const [L2, C2, H2] = curve[i + 1];
            if (L2 <= L && L <= L1) {
                const t = (L1 - L) / (L1 - L2);
                const d = pyMod(H2 - H1 + 180, 360) - 180;
                return [C1 + (C2 - C1) * t, pyMod(H1 + d * t, 360)];
            }
        }
        const last = curve[curve.length - 1];
        return [last[1], last[2]];
    };
    const yb = luminance(BG.dark);
    const out: Partial<Record<Scale, string>> = {};
    for (const s of scales) {
        const k = s === '400' ? DARK_400_CHROMA_FACTOR : 1.0;
        const yt = TARGET_CONTRAST.dark[s] * (yb + 0.05) - 0.05;
        let lo = 0;
        let hi = 1;
        let L = 0.5;
        for (let i = 0; i < 50; i++) {
            L = (lo + hi) / 2;
            const [C, H] = at(L);
            if (clampedLuminance(oklchToLinRgb(L, gamutChroma(L, C * k, H), H)) < yt) lo = L;
            else hi = L;
        }
        const [C, H] = at(L);
        out[s] = toHex(oklchToLinRgb(L, gamutChroma(L, C * k, H), H));
    }
    return out;
};

const hueOf = (hex: string) => hexToOklch(hex)[2];

const yellowFamily = (hues: HueTable) =>
    new Set(Object.keys(hues).filter((c) => inYellowFamily(hues[c]['200'])));

const capFor = (caps: Caps, yellow: boolean) => (s: ColorScale) =>
    yellow ? caps[s].yellow : caps[s].normal;

let baseHueTable: HueTable | undefined;
/** Hue table of the 11 base colors. */
export const getBaseHueTable = () => (baseHueTable ??= buildHueTable(LEONARDO_KEYS));

let baseCaps: Record<Mode, Caps> | undefined;
/**
 * 050–200 chroma caps, always from the default 11 base colors. Replacing or adding colors
 * therefore never moves the other colors' 050–200 cells.
 */
export const getBaseCaps = () =>
    (baseCaps ??= (() => {
        const hues = getBaseHueTable();
        const yellow = yellowFamily(hues);
        const light = capsFrom((c, s) => hues[c][s], yellow, 'light');
        const hueDark = Object.fromEntries(
            BASE_COLORS.map((c) => {
                const row = lightColor(hues[c], capFor(light, yellow.has(c)));
                return [c, hueOf(darkUpper(row, ['400'])['400']!)];
            }),
        );
        return { light, dark: capsFrom((c) => hueDark[c], yellow, 'dark') };
    })());

/**
 * Raw light and dark tables from a hue table. Mirrors `generate()` in the reference script.
 * The brand HEX is pinned into one light cell after 300, where the script applies HEX_OVERRIDE;
 * dark then derives from the pinned light curve and never pins the brand.
 */
export const generateFromHues = (
    hues: HueTable,
    { brand }: { brand?: { name: string; hex: string } } = {},
) => {
    const colors = Object.keys(hues);
    const yellow = yellowFamily(hues);
    const caps = getBaseCaps();

    // ---- Light ----
    const light: RawPalette = Object.fromEntries(
        colors.map((c) => [c, lightColor(hues[c], capFor(caps.light, yellow.has(c)))]),
    );
    let brandScale: ColorScale | undefined;
    if (brand) {
        brandScale = assignCell(brand.hex, 'light', light[brand.name]);
        if (!brandScale) throw new Error(`No light cell fits brand color #${brand.hex}`);
        light[brand.name][brandScale] = brand.hex;
    }

    // ---- Dark ----
    const dark: RawPalette = Object.fromEntries(
        colors.map((c) => [c, darkUpper(light[c], COLOR_SCALES.slice(4))]),
    );
    for (const c of colors) {
        const hue = hueOf(dark[c]['400']!); // dark 050–300 share the dark 400 hue
        const cap = capFor(caps.dark, yellow.has(c));
        const at = (s: ColorScale, chroma: number) =>
            solve(TARGET_CONTRAST.dark[s], BG.dark, chroma, hue, false).hex;
        for (const s of CAPPED_SCALES) dark[c][s] = at(s, cap(s));
        dark[c]['300'] = at('300', (chromaOf(dark[c]['200']!) + chromaOf(dark[c]['400']!)) / 2);
    }

    return { light, dark, brandScale };
};

/** Gray: chroma 0 against the fixed backgrounds, 000–900. */
export const generateGray = (): Record<Mode, Record<Scale, string>> => {
    const row = (mode: Mode) =>
        Object.fromEntries(
            SCALES.map((s) => [
                s,
                solve(TARGET_CONTRAST[mode][s], BG[mode], 0, 0, isDarkerThanBg(mode, s)).hex,
            ]),
        ) as Record<Scale, string>;
    return { light: row('light'), dark: row('dark') };
};
