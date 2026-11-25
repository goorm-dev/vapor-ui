import { hexToOklch, luminance, pyMod, pyRound2 } from '../../domain/color-math';
import type { ColorScale } from '../../domain/models/scale';
import { ANCHOR_SCALES, COLOR_SCALES } from '../../domain/models/scale';
import type { HueAnchors } from '../../domain/models/theme';
import { BASE_COLORS, BG, HUE_ANCHORS, TARGET_CONTRAST } from '../constants/palette-rules';

/** Hue (degrees) per color per scale. Everything after this table reads only the table. */
export type HueTable = Record<string, Record<ColorScale, number>>;

const wrap = (d: number) => pyMod(d + 180, 360) - 180;

/** Curve x axis: OKLab L of the neutral that hits each light target on white, the same for every color. */
const LIGHT_L = Object.fromEntries(
    COLOR_SCALES.map((s) => [
        s,
        ((luminance(BG.light) + 0.05) / TARGET_CONTRAST.light[s] - 0.05) ** (1 / 3),
    ]),
) as Record<ColorScale, number>;

/**
 * Hue of every step from the three anchors: each anchor unwrapped the short way from the one
 * before (050→600, 600→900), joined over `LIGHT_L` by a Fritsch–Carlson monotone cubic, so the
 * curve never leaves the anchors' range.
 */
export const anchorHues = (anchors: HueAnchors): Record<ColorScale, number> => {
    let prev = anchors['050'];
    const pts = ANCHOR_SCALES.map((s) => {
        prev += wrap(anchors[s] - prev);
        return [LIGHT_L[s], prev] as const;
    }).sort((p, q) => p[0] - q[0]);
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const d = [0, 1].map((i) => (ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
    const m = [d[0], d[0] * d[1] <= 0 ? 0 : (2 * d[0] * d[1]) / (d[0] + d[1]), d[1]];
    const out = {} as Record<ColorScale, number>;
    for (const s of COLOR_SCALES) {
        const x = LIGHT_L[s];
        const i = x <= xs[1] ? 0 : 1;
        const h = xs[i + 1] - xs[i];
        const t = (x - xs[i]) / h;
        const t2 = t * t;
        const t3 = t2 * t;
        const y =
            (2 * t3 - 3 * t2 + 1) * ys[i] +
            (t3 - 2 * t2 + t) * h * m[i] +
            (-2 * t3 + 3 * t2) * ys[i + 1] +
            (t3 - t2) * h * m[i + 1];
        out[s] = pyRound2(pyMod(y, 360));
    }
    return out;
};

/** Anchors from one HEX: the anchors of the base color whose 500 hue is nearest, shifted by the hue difference. */
export const anchorsFromHex = (hex: string, baseHues: HueTable): HueAnchors => {
    const h = hexToOklch(hex)[2];
    const hueGap = (c: string) => Math.abs(wrap(baseHues[c]['500'] - h));
    const near = BASE_COLORS.reduce((best, c) => (hueGap(c) < hueGap(best) ? c : best));
    const d = wrap(h - baseHues[near]['500']);
    return Object.fromEntries(
        ANCHOR_SCALES.map((s) => [s, pyMod(HUE_ANCHORS[near][s] + d, 360)]),
    ) as HueAnchors;
};
