import type { PaletteCheck, Scale, ThemeResult } from '@vapor-ui/color-generator';
import { generatePrimitiveColorPalette, validatePalette } from '@vapor-ui/color-generator';

import type { Hues, ThemeDraft } from './theme-draft';
import {
    HUE_RANGE,
    draftToOptions,
    hueDelta,
    hueOf,
    normalizeHue,
    themeDraftReducer,
    withoutHues,
} from './theme-draft';

type Cell = { name: string; scale: Scale };

/** A light hue that clears the selected cell's `hue-gap` warning, on that cell or a partner. */
export type HueRecommendation =
    | { kind: 'move'; name: string; scale: Scale; from: number; hue: number }
    | { kind: 'none'; reason: string };

type Move = Extract<HueRecommendation, { kind: 'move' }>;

const STEP = 0.5;

/** `light blue-500 · light sky-500: hue gap …` → both palette names and the shared scale. */
const PAIR = /^(?:light|dark) ([a-z][a-z0-9-]*)-(\d{3}) · (?:light|dark) ([a-z][a-z0-9-]*)-\d{3}:/;

/** Palettes whose same-scale cell sits within the hue gap of `cell`, in light or dark. */
const partnersOf = (checks: PaletteCheck[], { name, scale }: Cell) => {
    const details = checks.find((c) => c.id === 'hue-gap')?.details ?? [];
    const names = details.flatMap((detail) => {
        const [, a, s, b] = detail.match(PAIR) ?? [];
        if (s !== scale) return [];
        return a === name ? [b] : b === name ? [a] : [];
    });
    return [...new Set(names)];
};

const problemCount = (checks: PaletteCheck[]) =>
    checks.reduce((n, c) => n + (c.status === 'ok' ? 0 : c.details.length), 0);

const lightHue = (theme: ThemeResult, { name, scale }: Cell) =>
    hueOf(theme.lightModeTokens.palettes.find((p) => p.name === name)!.chips[scale].oklch);

const huesOf = (draft: ThemeDraft, name: string): Hues =>
    (draft.brand?.name === name
        ? draft.brand.hues
        : draft.basics.find((p) => p.name === name)?.hues) ?? {};

const checksFor = (draft: ThemeDraft) => {
    try {
        return validatePalette(generatePrimitiveColorPalette(draftToOptions(draft)));
    } catch {
        return null;
    }
};

/**
 * Searches, from each candidate's current light hue, in 0.5° steps within ±HUE_RANGE of its
 * generated hue, for a hue that clears `cell` from the hue-gap check without adding problems
 * elsewhere, plus one more step of margin. Candidates are `cell` and its hue-gap partners at the
 * same scale. The brand cell never moves, and cells the designer already edited move only when
 * nothing else works. Yields after each palette generation (~60 ms) so a UI can run it in
 * slices; returns `null` when `cell` has no hue-gap warning.
 */
export function* searchHue(
    draft: ThemeDraft,
    cell: Cell,
): Generator<void, HueRecommendation | null> {
    const theme = generatePrimitiveColorPalette(draftToOptions(draft));
    const checks = validatePalette(theme);
    const partners = partnersOf(checks, cell);
    if (partners.length === 0) return null;
    yield;

    const baseline = generatePrimitiveColorPalette(draftToOptions(withoutHues(draft)));
    const limit = problemCount(checks);
    let worse = false;

    function* passes(c: Cell, hue: number) {
        yield;
        const next = checksFor(themeDraftReducer(draft, { type: 'set-hue', ...c, hue }));
        if (!next || partnersOf(next, cell).length > 0) return false;
        if (problemCount(next) <= limit) return true;
        worse = true;
        return false;
    }

    function* search(c: Cell, others: string[]): Generator<void, Move | null> {
        const from = huesOf(draft, c.name)[c.scale] ?? lightHue(theme, c);
        const base = lightHue(baseline, c);
        const nearest = others
            .map((o) => hueDelta(lightHue(theme, { name: o, scale: c.scale }), from))
            .reduce((a, b) => (Math.abs(b) < Math.abs(a) ? b : a));
        const away = Math.sign(nearest) || 1;
        const inRange = (h: number) => Math.abs(hueDelta(base, h)) <= HUE_RANGE;
        for (const dir of [away, -away])
            for (let h = from + dir * STEP; inRange(h); h += dir * STEP) {
                if (!(yield* passes(c, h))) continue;
                const margin = h + dir * STEP;
                const hue = inRange(margin) && (yield* passes(c, margin)) ? margin : h;
                return { kind: 'move', ...c, from, hue: normalizeHue(hue) };
            }
        return null;
    }

    const brand = theme.brand;
    const candidates = [
        { cell, others: partners },
        ...partners.map((name) => ({ cell: { name, scale: cell.scale }, others: [cell.name] })),
    ].filter(({ cell: c }) => !(c.name === brand?.name && c.scale === brand.scale));
    const edited = (c: Cell) => c.scale in huesOf(draft, c.name);

    for (const tier of [false, true]) {
        let best: Move | null = null;
        for (const { cell: c, others } of candidates) {
            if (edited(c) !== tier) continue;
            const move = yield* search(c, others);
            const size = (m: Move) => Math.abs(hueDelta(m.from, m.hue));
            if (move && (!best || size(move) < size(best))) best = move;
        }
        if (best) return best;
    }
    return {
        kind: 'none',
        reason: worse
            ? '간격을 벌리면 다른 경고가 늘어요'
            : `±${HUE_RANGE}° 안에서 간격을 벌릴 수 없어요`,
    };
}

/** {@link searchHue} run to the end in one go. */
export function recommendHue(draft: ThemeDraft, cell: Cell): HueRecommendation | null {
    const steps = searchHue(draft, cell);
    for (;;) {
        const step = steps.next();
        if (step.done) return step.value;
    }
}
