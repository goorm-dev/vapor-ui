import {
    clampedLuminance,
    gamutChroma,
    hexToOklch,
    luminance,
    oklchToLinRgb,
    pyMod,
    pyRound2,
    toHex,
} from '../../domain/color-math';
import type { ColorScale } from '../../domain/models/scale';
import { COLOR_SCALES } from '../../domain/models/scale';
import { BASE_COLORS, BG, LEONARDO_KEYS, TARGET_CONTRAST } from '../constants/palette-rules';

/** Hue (degrees) per color per scale. Everything after this table reads only the table. */
export type HueTable = Record<string, Record<ColorScale, number>>;

type Node = [L: number, C: number, H: number | null];

const interpLch = (a: Node, b: Node, t: number): Node => {
    let ha = a[2];
    let hb = b[2];
    if (ha === null) ha = hb;
    if (hb === null) hb = ha;
    const h =
        ha === null || hb === null ? null : pyMod(ha + (pyMod(hb - ha + 180, 360) - 180) * t, 360);
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, h];
};

/** Hue at each light target contrast along white → keys (lightest first) → black. */
export const leonardoHues = (keys: string[]): Record<ColorScale, number> => {
    const sorted = keys.map((k): Node => hexToOklch(k)).sort((p, q) => q[0] - p[0]);
    const nodes: Node[] = [[1, 0, null], ...sorted, [0, 0, null]];
    const n = nodes.length - 1;
    const at = (u: number) => {
        const x = Math.min(Math.max(u, 0), 1) * n;
        const i = Math.min(Math.trunc(x), n - 1);
        return interpLch(nodes[i], nodes[i + 1], x - i);
    };
    const out = {} as Record<ColorScale, number>;
    for (const s of COLOR_SCALES) {
        const yt = (luminance(BG.light) + 0.05) / TARGET_CONTRAST.light[s] - 0.05;
        let lo = 0;
        let hi = 1;
        for (let i = 0; i < 50; i++) {
            const mid = (lo + hi) / 2;
            const [L, C, H] = at(mid);
            if (clampedLuminance(oklchToLinRgb(L, C, H || 0)) > yt) lo = mid;
            else hi = mid;
        }
        out[s] = pyRound2(pyMod(at((lo + hi) / 2)[2] ?? 0, 360));
    }
    return out;
};

/** Hue table for named key-color sets; hue corrections are out of scope, so this is the plain Leonardo hue. */
export const buildHueTable = (keys: Record<string, string[]>): HueTable =>
    Object.fromEntries(Object.entries(keys).map(([name, k]) => [name, leonardoHues(k)]));

/**
 * Key colors from one HEX: borrow the keys of the base color whose 500 hue is nearest,
 * rotate them by the hue difference, then swap the key nearest in lightness for the HEX.
 */
export const keysFromHex = (hex: string, baseHues: HueTable): string[] => {
    const h = hexToOklch(hex)[2];
    const hueGap = (c: string) => Math.abs(pyMod(baseHues[c]['500'] - h + 180, 360) - 180);
    const near = BASE_COLORS.reduce((best, c) => (hueGap(c) < hueGap(best) ? c : best));
    const d = pyMod(h - baseHues[near]['500'] + 180, 360) - 180;
    const keys = LEONARDO_KEYS[near].map((k) => {
        const [L, C, H] = hexToOklch(k);
        const H2 = pyMod(H + d, 360);
        return toHex(oklchToLinRgb(L, gamutChroma(L, C, H2), H2));
    });
    const L0 = hexToOklch(hex)[0];
    const gap = (i: number) => Math.abs(hexToOklch(keys[i])[0] - L0);
    const li = keys.reduce((best, _, i) => (gap(i) < gap(best) ? i : best), 0);
    keys[li] = hex;
    return keys;
};
