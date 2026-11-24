import type { PaletteCheck, Scale } from '@vapor-ui/color-generator';
import { generatePrimitiveColorPalette, validatePalette } from '@vapor-ui/color-generator';
import { describe, expect, it } from 'vitest';

import type { HueRecommendation } from './hue-recommendation';
import { recommendHue } from './hue-recommendation';
import type { ThemeAction, ThemeDraft } from './theme-draft';
import {
    draftToOptions,
    flaggedCells,
    hueOf,
    initialDraft,
    themeDraftReducer,
} from './theme-draft';

const run = (...actions: ThemeAction[]) => actions.reduce(themeDraftReducer, initialDraft);
const checksOf = (draft: ThemeDraft) =>
    validatePalette(generatePrimitiveColorPalette(draftToOptions(draft)));
const hueGapFlags = (checks: PaletteCheck[]) =>
    flaggedCells(checks.filter((c) => c.id === 'hue-gap'));
const problems = (checks: PaletteCheck[]) =>
    checks.reduce((n, c) => n + (c.status === 'ok' ? 0 : c.details.length), 0);
const lightHue = (draft: ThemeDraft, name: string, scale: Scale) =>
    hueOf(
        generatePrimitiveColorPalette(draftToOptions(draft)).lightModeTokens.palettes.find(
            (p) => p.name === name,
        )!.chips[scale].oklch,
    );

/** Applies a move and checks the selected cell is clear with no new problems. */
const expectResolves = (draft: ThemeDraft, cell: string, rec: HueRecommendation | null) => {
    if (rec?.kind !== 'move') throw new Error(`expected a move, got ${JSON.stringify(rec)}`);
    const { name, scale, hue } = rec;
    const after = checksOf(themeDraftReducer(draft, { type: 'set-hue', name, scale, hue }));
    const flags = hueGapFlags(after);
    expect(flags.has(`light ${cell}`)).toBe(false);
    expect(flags.has(`dark ${cell}`)).toBe(false);
    expect(problems(after)).toBeLessThanOrEqual(problems(checksOf(draft)));
    return rec;
};

// `#2659f2` pins brand-500 4.9° from blue-500 in light only.
const brand = run({ type: 'set-brand', name: 'brand', hex: '#2659f2' });

describe('recommendHue', () => {
    it('returns null for a cell without a hue-gap warning', () => {
        expect(hueGapFlags(checksOf(initialDraft)).has('light red-500')).toBe(false);
        expect(recommendHue(initialDraft, { name: 'red', scale: '500' })).toBeNull();
    });

    it('resolves a hue gap between two default palettes', () => {
        expect(hueGapFlags(checksOf(initialDraft)).has('light red-700')).toBe(true);
        expectResolves(
            initialDraft,
            'red-700',
            recommendHue(initialDraft, { name: 'red', scale: '700' }),
        );
    });

    it('never moves the brand cell', () => {
        expect(generatePrimitiveColorPalette(draftToOptions(brand)).brand?.scale).toBe('500');
        const rec = expectResolves(
            brand,
            'blue-500',
            recommendHue(brand, { name: 'blue', scale: '500' }),
        );
        expect(rec.name).toBe('blue');
    });

    it('moves an untouched partner before a cell the designer edited', () => {
        const edited = run({
            type: 'set-hue',
            name: 'red',
            scale: '700',
            hue: lightHue(initialDraft, 'red', '700'),
        });
        const rec = expectResolves(
            edited,
            'red-700',
            recommendHue(edited, { name: 'red', scale: '700' }),
        );
        expect(rec).toMatchObject({ name: 'orange', scale: '700' });
    });

    it('moves an edited cell when nothing else can move', () => {
        const edited = themeDraftReducer(brand, {
            type: 'set-hue',
            name: 'blue',
            scale: '500',
            hue: lightHue(brand, 'blue', '500'),
        });
        const rec = expectResolves(
            edited,
            'blue-500',
            recommendHue(edited, { name: 'blue', scale: '500' }),
        );
        expect(rec.name).toBe('blue');
    });

    it('resolves a dark-only hue gap by moving a light cell', () => {
        const draft = run({ type: 'add-basic', name: 'mint', hex: '#f22626' });
        const flags = hueGapFlags(checksOf(draft));
        expect(flags.has('dark mint-400')).toBe(true);
        expect(flags.has('light mint-400')).toBe(false);
        expectResolves(draft, 'mint-400', recommendHue(draft, { name: 'mint', scale: '400' }));
    });

    // Slow: the whole ±30° range is searched. Dark moves about 1/10 of the light hue, so a
    // 0.7° dark gap against the pinned brand cell cannot open.
    it('reports none when no hue in range clears the gap', { timeout: 30_000 }, () => {
        const draft = run({ type: 'set-brand', name: 'brand', hex: '#2a72e5' });
        expect(recommendHue(draft, { name: 'blue', scale: '400' })).toEqual({
            kind: 'none',
            reason: '±30° 안에서 간격을 벌릴 수 없어요',
        });
    });
});
