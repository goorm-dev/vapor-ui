import type { PaletteCheck, ThemeResult } from '../../domain';
import type { Oklch } from '../../domain/color-math';
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
    CHROMA_SPIKE_FACTOR,
    EXPRESSIBLE_MAX,
    TARGET_CONTRAST,
} from '../constants';
import { isMonotone } from '../engine/brand';
import { anchorHues, anchorsFromHex } from '../engine/hue';
import {
    darkUpper,
    getBaseCaps,
    getBaseHueTable,
    inYellowFamily,
    maxChroma,
} from '../engine/palette';
import { primaryAnchor, rawRow } from './get-semantic-tokens';

const HUE_GAP_MIN = 5.5;
const HUE_GAP_EXCEPTIONS = [['blue', 'cobalt']];
const TARGET_TOLERANCE = 0.01;
/** HEX rounding moves chroma by up to 0.0013 in the reference output. */
const CHROMA_TOLERANCE = 0.003;
const DARK_UPPER = COLOR_SCALES.slice(4);

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

const status = (details: string[], bad: 'warn' | 'fail') => (details.length ? bad : 'ok');

/** One detail per close pair, naming both cells so each can be flagged. */
const hueGap = (rows: Rows): PaletteCheck => {
    const details: string[] = [];
    for (const m of MODES) {
        const colors = Object.keys(rows[m]);
        for (const s of COLOR_SCALES)
            colors.forEach((a, i) => {
                for (const b of colors.slice(i + 1)) {
                    if (HUE_GAP_EXCEPTIONS.some((e) => e.includes(a) && e.includes(b))) continue;
                    const d = hueDiff(hexToOklch(rows[m][a][s])[2], hexToOklch(rows[m][b][s])[2]);
                    if (d < HUE_GAP_MIN)
                        details.push(
                            `${m} ${a}-${s} · ${m} ${b}-${s}: hue gap ${d.toFixed(1)}° (min ${HUE_GAP_MIN}°)`,
                        );
                }
            });
    }
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
 * Chroma limit of light 500–900 at `COLOR_SCALES[i]`, as the engine applies it: the previous
 * cell's final chroma, and the next cell's chroma before its own limit (the expressible maximum
 * at its hue).
 */
const spikeLimit = (P: Record<ColorScale, Oklch>, i: number) => {
    const prev = P[COLOR_SCALES[i - 1]][1];
    const next = COLOR_SCALES[i + 1];
    if (!next) return CHROMA_SPIKE_FACTOR * prev;
    return (
        (CHROMA_SPIKE_FACTOR *
            (prev + maxChroma(TARGET_CONTRAST.light[next], BG.light, P[next][2], true))) /
        2
    );
};

/**
 * Each cell's chroma follows its scale's rule, recomputed at the cell's own lightness and hue.
 * Dark 400–900 are rederived from the light row as the engine does, at the engine's unrounded
 * lightness: a HEX-rounded lightness lands elsewhere on a steep light curve. The brand cell is a pinned HEX, so it is exempt, and so is a light 300 next to it, whose
 * rule reads the 200 and 400 chroma from before the pin.
 */
const chroma = (
    rows: Rows,
    isBrandCell: IsBrandCell,
    isYellow: (c: string) => boolean,
): PaletteCheck => {
    const caps = getBaseCaps();
    const details: string[] = [];
    for (const m of MODES)
        for (const [c, row] of Object.entries(rows[m])) {
            const P = Object.fromEntries(
                COLOR_SCALES.map((s) => [s, hexToOklch(row[s])]),
            ) as Record<ColorScale, ReturnType<typeof hexToOklch>>;
            const yellow = isYellow(c);
            const derived: Partial<Record<ColorScale, string>> =
                m === 'dark' ? darkUpper(rows.light[c], DARK_UPPER) : {};
            for (const s of COLOR_SCALES) {
                if (isBrandCell(m, c, s)) continue;
                const i = COLOR_SCALES.indexOf(s);
                const capped = m === 'light' && i > COLOR_SCALES.indexOf('400');
                // A neighbour's rule input moved with the pin: light 300 reads 200 and 400, a
                // capped 500–900 reads the cells on either side.
                if (
                    m === 'light' &&
                    (s === '300' || capped) &&
                    (isBrandCell(m, c, COLOR_SCALES[i - 1]) ||
                        isBrandCell(m, c, COLOR_SCALES[i + 1]))
                )
                    continue;
                const [L, C, H] = P[s];
                let expect: number;
                if (derived[s]) expect = hexToOklch(derived[s])[1];
                else {
                    const want = CAPPED_SCALES.includes(s)
                        ? caps[m][s][yellow ? 'yellow' : 'normal']
                        : s === '300'
                          ? (P['200'][1] + P['400'][1]) / 2
                          : capped
                            ? Math.min(EXPRESSIBLE_MAX, spikeLimit(P, i))
                            : EXPRESSIBLE_MAX;
                    expect = [gamutChroma(L, want, H), upperMaxChroma(L, want, H)].reduce((a, b) =>
                        Math.abs(b - C) < Math.abs(a - C) ? b : a,
                    );
                }
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

    // The engine reads the yellow family off the hue table. A brand row's table comes from the
    // brand HEX; every other row keeps an unpinned light 200, whose hue is the table's.
    const isYellow = (c: string) =>
        inYellowFamily(
            c === brand?.name
                ? anchorHues(
                      anchorsFromHex(rows.light[c][brand.scale as ColorScale], getBaseHueTable()),
                  )['200']
                : hexToOklch(rows.light[c]['200'])[2],
        );

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
        chroma(rows, isBrandCell, isYellow),
        { id: 'brand-monotone', status: status(monotone, 'warn'), details: monotone },
        { id: 'primary-anchor', status: status(weak, 'warn'), details: weak },
    ];
}
