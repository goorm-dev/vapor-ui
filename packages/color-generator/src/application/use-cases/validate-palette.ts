import type { PaletteCheck, ThemeResult } from '../../domain';
import {
    contrast,
    gamutChroma,
    hexToOklch,
    inGamut,
    oklchToLinRgb,
    pyMod,
} from '../../domain/color-math';
import type { ColorScale, Mode } from '../../domain/models/scale';
import { COLOR_SCALES, MODES } from '../../domain/models/scale';
import {
    A11Y_RULES,
    BG,
    CAPPED_SCALES,
    DARK_400_CHROMA_FACTOR,
    EXPRESSIBLE_MAX,
    TARGET_CONTRAST,
    YELLOW_FAMILY_RANGE,
} from '../constants';
import { isMonotone } from '../engine/brand';
import { getBaseCaps } from '../engine/palette';
import { primaryAnchor, rawRow } from './get-semantic-tokens';

const HUE_GAP_MIN = 5.5;
const HUE_GAP_EXCEPTIONS = [['blue', 'cobalt']];
const TARGET_TOLERANCE = 0.01;
/** HEX rounding moves chroma by up to 0.0013 in the reference output. */
const CHROMA_TOLERANCE = 0.003;

type Rows = Record<Mode, Record<string, Record<ColorScale, string>>>;
type IsBrandCell = (m: Mode, c: string, s: ColorScale) => boolean;

const hueDiff = (a: number, b: number) => Math.abs(pyMod(a - b + 180, 360) - 180);

/** Largest chroma <= C in sRGB, accepting the upper end of a split in-gamut range. */
const upperMaxChroma = (L: number, C: number, H: number, step = 0.0005) => {
    if (inGamut(oklchToLinRgb(L, C, H))) return C;
    let c = C;
    while (c > 0 && !inGamut(oklchToLinRgb(L, c, H))) c -= step;
    let lo = Math.max(c, 0);
    let hi = c + step;
    for (let i = 0; i < 30; i++) {
        const mid = (lo + hi) / 2;
        if (inGamut(oklchToLinRgb(L, mid, H))) lo = mid;
        else hi = mid;
    }
    return lo;
};

/** Chroma along the light curve at lightness L, as dark 400–900 derive it. */
const lightCurveChroma = (lightRow: Record<ColorScale, string>) => {
    const curve = COLOR_SCALES.map((s) => hexToOklch(lightRow[s])).sort(
        (p, q) => q[0] - p[0] || q[1] - p[1] || q[2] - p[2],
    );
    return (L: number) => {
        if (L >= curve[0][0]) return curve[0][1];
        for (let i = 0; i + 1 < curve.length; i++) {
            const [L1, C1] = curve[i];
            const [L2, C2] = curve[i + 1];
            if (L2 <= L && L <= L1) return C1 + ((C2 - C1) * (L1 - L)) / (L1 - L2);
        }
        return curve[curve.length - 1][1];
    };
};

const status = (details: string[], bad: 'warn' | 'fail') => (details.length ? bad : 'ok');

const hueGap = (rows: Rows): PaletteCheck => {
    const pairs = new Map<string, string[]>();
    for (const m of MODES) {
        const colors = Object.keys(rows[m]);
        for (const s of COLOR_SCALES)
            colors.forEach((a, i) => {
                for (const b of colors.slice(i + 1)) {
                    if (HUE_GAP_EXCEPTIONS.some((e) => e.includes(a) && e.includes(b))) continue;
                    const d = hueDiff(hexToOklch(rows[m][a][s])[2], hexToOklch(rows[m][b][s])[2]);
                    if (d >= HUE_GAP_MIN) continue;
                    const key = `${a} · ${b}`;
                    pairs.set(key, [...(pairs.get(key) ?? []), `${m} ${s} ${d.toFixed(1)}°`]);
                }
            });
    }
    const details = Array.from(pairs).map(
        ([pair, v]) => `${pair}: hue gap under ${HUE_GAP_MIN}° (${v.join(', ')})`,
    );
    return { id: 'hue-gap', status: status(details, 'warn'), details };
};

const targetContrast = (rows: Rows, isBrandCell: IsBrandCell): PaletteCheck => {
    const details: string[] = [];
    for (const m of MODES)
        for (const [c, row] of Object.entries(rows[m]))
            for (const s of COLOR_SCALES) {
                if (isBrandCell(m, c, s)) continue;
                const r = contrast(row[s], BG[m]);
                const target = TARGET_CONTRAST[m][s];
                if (Math.abs(r / target - 1) > TARGET_TOLERANCE)
                    details.push(`${m} ${c}-${s}: ${r.toFixed(3)} (target ${target.toFixed(3)})`);
            }
    return { id: 'target-contrast', status: status(details, 'fail'), details };
};

const a11y = (rows: Rows): PaletteCheck => {
    const details: string[] = [];
    for (const { mode, scale, fg, bg, min, label } of A11Y_RULES)
        for (const [c, row] of Object.entries(rows[mode])) {
            const hex = row[scale];
            const r = contrast(fg === 'self' ? hex : fg, bg === 'self' ? hex : bg);
            if (r < min)
                details.push(
                    `${mode} ${c}-${scale} (${label}): ${r.toFixed(3)} < ${min.toFixed(3)}`,
                );
        }
    return { id: 'a11y', status: status(details, 'fail'), details };
};

/**
 * Each cell's chroma follows its scale's rule, recomputed at the cell's own lightness and hue.
 * The brand cell is a pinned HEX, so it is exempt, and so is a light 300 next to it, whose
 * rule reads the 200 and 400 chroma from before the pin.
 */
const chroma = (rows: Rows, isBrandCell: IsBrandCell): PaletteCheck => {
    const caps = getBaseCaps();
    const details: string[] = [];
    for (const m of MODES)
        for (const [c, row] of Object.entries(rows[m])) {
            const P = Object.fromEntries(
                COLOR_SCALES.map((s) => [s, hexToOklch(row[s])]),
            ) as Record<ColorScale, ReturnType<typeof hexToOklch>>;
            const h200 = hexToOklch(rows.light[c]['200'])[2];
            const yellow = YELLOW_FAMILY_RANGE[0] <= h200 && h200 <= YELLOW_FAMILY_RANGE[1];
            const lightC = lightCurveChroma(rows.light[c]);
            for (const s of COLOR_SCALES) {
                if (isBrandCell(m, c, s)) continue;
                if (
                    m === 'light' &&
                    s === '300' &&
                    (isBrandCell(m, c, '200') || isBrandCell(m, c, '400'))
                )
                    continue;
                const [L, C, H] = P[s];
                let want: number;
                if (CAPPED_SCALES.includes(s)) want = caps[m][s][yellow ? 'yellow' : 'normal'];
                else if (s === '300') want = (P['200'][1] + P['400'][1]) / 2;
                else if (m === 'light') want = EXPRESSIBLE_MAX;
                else want = lightC(L) * (s === '400' ? DARK_400_CHROMA_FACTOR : 1.0);
                const expect = [gamutChroma(L, want, H), upperMaxChroma(L, want, H)].reduce(
                    (a, b) => (Math.abs(b - C) < Math.abs(a - C) ? b : a),
                );
                if (Math.abs(C - expect) > CHROMA_TOLERANCE)
                    details.push(
                        `${m} ${c}-${s}: chroma ${C.toFixed(4)} (rule ${expect.toFixed(4)})`,
                    );
            }
        }
    return { id: 'chroma', status: status(details, 'fail'), details };
};

/**
 * Checks a generated palette against the reference script's rules plus the brand and primary
 * anchor rules. `gray` is not checked: it has no chroma and is solved straight to its targets.
 * The primary palette is the brand palette, or `blue` without a brand.
 */
export function validatePalette(result: ThemeResult): PaletteCheck[] {
    const rows = Object.fromEntries(
        MODES.map((m) => [
            m,
            Object.fromEntries(
                (m === 'light' ? result.lightModeTokens : result.darkModeTokens).palettes
                    .filter((p) => p.name !== 'gray')
                    .map((p) => [p.name, rawRow(p)]),
            ),
        ]),
    ) as Rows;
    const { brand } = result;
    const isBrandCell: IsBrandCell = (m, c, s) =>
        m === 'light' && c === brand?.name && s === brand.scale;

    const monotone: string[] = [];
    if (brand) {
        const s = brand.scale as ColorScale;
        const row = rows.light[brand.name];
        if (!isMonotone(row[s], 'light', s, row))
            monotone.push(`light ${brand.name}-${s} breaks the contrast order`);
    }

    const primary = brand?.name ?? 'blue';
    const anchor = primaryAnchor(result, primary);
    const weak = MODES.flatMap((m) => {
        const r = contrast(rows[m][primary][anchor[m]], BG[m]);
        return r < 3
            ? [`${m} ${primary}-${anchor[m]}: ${r.toFixed(3)} < 3.000 against #${BG[m]}`]
            : [];
    });

    return [
        hueGap(rows),
        targetContrast(rows, isBrandCell),
        a11y(rows),
        chroma(rows, isBrandCell),
        { id: 'brand-monotone', status: status(monotone, 'warn'), details: monotone },
        { id: 'primary-anchor', status: status(weak, 'warn'), details: weak },
    ];
}
