/**
 * sRGB <-> OKLCH conversion and WCAG 2.x contrast, ported 1:1 from
 * `reference/generate_palette.py`. Operation order and rounding follow the script,
 * so do not "simplify" a formula: a one-ulp change can flip a HEX digit.
 *
 * HEX values here are 6 uppercase digits without `#`, like the script.
 */

/** Python's float `%`: the result takes the sign of the divisor. */
export const pyMod = (a: number, n: number) => {
    const m = a % n;
    return m !== 0 && Math.sign(m) !== Math.sign(n) ? m + n : m;
};

/** Python's `round(x)`: ties go to the even integer. */
const roundHalfEven = (v: number) => {
    const f = Math.floor(v);
    const d = v - f;
    if (d !== 0.5) return d > 0.5 ? f + 1 : f;
    return f % 2 === 0 ? f : f + 1;
};

/** Python's `round(x, 2)`: rounds the exact binary value, ties to even. */
export const pyRound2 = (x: number) => {
    const s = x * 100;
    // An exact tie needs x to be a multiple of 1/8, where x * 100 is exact.
    if (Number.isInteger(x * 8) && s - Math.floor(s) === 0.5) return roundHalfEven(s) / 100;
    return Number(x.toFixed(2));
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const RAD_TO_DEG = 180 / Math.PI;
const DEG_TO_RAD = Math.PI / 180;

const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const gam = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

const hexRgb = (h: string) => [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

export const luminance = (h: string) => {
    const [r, g, b] = hexRgb(h).map(lin);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const contrast = (a: string, b: string) => {
    const la = luminance(a);
    const lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

/** Relative luminance of a linear RGB triple after clamping, as the script's search loops do. */
export const clampedLuminance = (rgb: number[]) => {
    const [r, g, b] = rgb.map(clamp01);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export type Oklch = [L: number, C: number, H: number];

export const hexToOklch = (h: string): Oklch => {
    const [r, g, b] = hexRgb(h).map(lin);
    const l = (0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b) ** (1 / 3);
    const m = (0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b) ** (1 / 3);
    const s = (0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b) ** (1 / 3);
    const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
    const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
    const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
    return [L, Math.hypot(a, bb), pyMod(Math.atan2(bb, a) * RAD_TO_DEG, 360)];
};

export const oklchToLinRgb = (L: number, C: number, H: number) => {
    const a = C * Math.cos(H * DEG_TO_RAD);
    const b = C * Math.sin(H * DEG_TO_RAD);
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
    return [
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ];
};

export const inGamut = (rgb: number[]) => rgb.every((x) => x >= -1e-6 && x <= 1 + 1e-6);

/**
 * Chroma values in (0, C) where a linear RGB channel turns. At fixed L and H each channel
 * is a cubic in chroma, so four evenly spaced samples define it exactly.
 */
const channelTurns = (L: number, C: number, H: number) => {
    const step = C / 3;
    const samples = [0, 1, 2, 3].map((i) => oklchToLinRgb(L, i * step, H));
    const turns: number[] = [];
    for (let ch = 0; ch < 3; ch++) {
        const [y0, y1, y2, y3] = samples.map((rgb) => rgb[ch]);
        const d1 = y1 - y0;
        const d2 = y2 - 2 * y1 + y0;
        const d3 = y3 - 3 * y2 + 3 * y1 - y0;
        // derivative in t = c / step: qa t^2 + qb t + qc
        const qa = d3 / 2;
        const qb = d2 - d3;
        const qc = d1 - d2 / 2 + d3 / 3;
        const disc = qb * qb - 4 * qa * qc;
        if (disc < 0) continue;
        const q = -(qb + Math.sign(qb || 1) * Math.sqrt(disc)) / 2;
        for (const t of [qa ? q / qa : NaN, q ? qc / q : NaN]) {
            if (t > 0 && t < 3) turns.push(t * step);
        }
    }
    return turns;
};

/** Last point from `inside` toward `outside` where `ok` holds, for `ok` that flips once. */
const edge = (ok: (c: number) => boolean, inside: number, outside: number) => {
    for (let i = 0; i < 60; i++) {
        const mid = (inside + outside) / 2;
        if (ok(mid)) inside = mid;
        else outside = mid;
    }
    return inside;
};

/** Largest in-gamut chroma in [a, b], where every channel is monotonic, or null. */
const topInGamut = (L: number, H: number, a: number, b: number) => {
    let lo = a;
    let hi = b;
    for (let ch = 0; ch < 3; ch++) {
        for (const ok of [
            (c: number) => oklchToLinRgb(L, c, H)[ch] >= -1e-6,
            (c: number) => oklchToLinRgb(L, c, H)[ch] <= 1 + 1e-6,
        ]) {
            const okA = ok(a);
            const okB = ok(b);
            if (okA && okB) continue;
            if (!okA && !okB) return null;
            if (okB) lo = Math.max(lo, edge(ok, b, a));
            else hi = Math.min(hi, edge(ok, a, b));
        }
    }
    return lo <= hi ? hi : null;
};

/**
 * Largest chroma <= C that stays in sRGB at fixed L and H. Blue hues have a split in-gamut
 * chroma range, so the search splits [0, C] where any channel turns and checks each
 * monotonic span from the top.
 */
export const gamutChroma = (L: number, C: number, H: number) => {
    if (inGamut(oklchToLinRgb(L, C, H))) return C;
    const cuts = [C, ...channelTurns(L, C, H), 0].sort((x, y) => y - x);
    for (let i = 0; i < cuts.length - 1; i++) {
        const top = topInGamut(L, H, cuts[i + 1], cuts[i]);
        if (top !== null) return top;
    }
    return 0;
};

export const toHex = (rgb: number[]) =>
    rgb
        .map((x) =>
            roundHalfEven(clamp01(gam(clamp01(x))) * 255)
                .toString(16)
                .toUpperCase()
                .padStart(2, '0'),
        )
        .join('');
