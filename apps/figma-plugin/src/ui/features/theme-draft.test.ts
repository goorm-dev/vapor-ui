import { generatePrimitiveColorPalette } from '@vapor-ui/color-generator';
import type { ThemeResult } from '@vapor-ui/color-generator';
import { describe, expect, it } from 'vitest';

import type { ThemeAction, ThemeDraft } from './theme-draft';
import {
    confirmationFor,
    draftToOptions,
    flaggedCells,
    hueOf,
    initialDraft,
    isValidName,
    primaryName,
    themeDraftReducer,
} from './theme-draft';

const run = (...actions: ThemeAction[]) => actions.reduce(themeDraftReducer, initialDraft);
const generate = (draft: ThemeDraft) => generatePrimitiveColorPalette(draftToOptions(draft));
const chip = (theme: ThemeResult, mode: 'light' | 'dark', name: string, scale: string) =>
    (mode === 'light' ? theme.lightModeTokens : theme.darkModeTokens).palettes.find(
        (p) => p.name === name,
    )!.chips[scale];
const basic = (draft: ThemeDraft, name: string) => draft.basics.find((p) => p.name === name);

describe('theme draft', () => {
    it('starts as the default palette with blue as primary', () => {
        expect(initialDraft.basics).toHaveLength(11);
        expect(initialDraft.basics.every((p) => p.preset)).toBe(true);
        expect(primaryName(initialDraft)).toBe('blue');
        expect(generate(initialDraft)).toEqual(generatePrimitiveColorPalette());
    });

    it('rotates one light cell, and dark follows', () => {
        const base = generate(initialDraft);
        const draft = run({ type: 'set-hue', name: 'red', scale: '500', hue: 10 });
        const theme = generate(draft);

        expect(hueOf(chip(theme, 'light', 'red', '500').oklch)).toBeCloseTo(10, 0);
        const darkRed = (t: ThemeResult) => t.darkModeTokens.palettes.find((p) => p.name === 'red');
        expect(darkRed(theme)).not.toEqual(darkRed(base));
        expect(chip(theme, 'light', 'blue', '500')).toEqual(chip(base, 'light', 'blue', '500'));
    });

    it('wraps hues into 0–360 and resets a cell with null', () => {
        const draft = run({ type: 'set-hue', name: 'red', scale: '500', hue: -5 });
        expect(basic(draft, 'red')!.hues).toEqual({ '500': 355 });

        const reset = themeDraftReducer(draft, {
            type: 'set-hue',
            name: 'red',
            scale: '500',
            hue: null,
        });
        expect(draftToOptions(reset)).toEqual(draftToOptions(initialDraft));
    });

    it('a new base HEX drops only that palette’s hue edits, after asking', () => {
        const draft = run(
            { type: 'set-hue', name: 'red', scale: '500', hue: 10 },
            { type: 'set-hue', name: 'blue', scale: '500', hue: 250 },
        );
        const action: ThemeAction = { type: 'set-hex', name: 'red', hex: '#FF0000' };

        expect(confirmationFor(draft, action)).toMatch(/red/);
        expect(confirmationFor(draft, { ...action, name: 'green' })).toBeNull();

        const next = themeDraftReducer(draft, action);
        expect(basic(next, 'red')).toMatchObject({ hex: '#ff0000', hues: {} });
        expect(basic(next, 'blue')!.hues).toEqual({ '500': 250 });
        expect(draftToOptions(next).basicColors).toEqual([{ name: 'red', hexcode: '#ff0000' }]);
    });

    it('adds a deletable color, and overwrites an existing name after asking', () => {
        const added = run({ type: 'add-basic', name: 'teal', hex: '#00a3a3' });
        expect(basic(added, 'teal')).toMatchObject({ preset: false, hex: '#00a3a3' });
        expect(generate(added).lightModeTokens.palettes.map((p) => p.name)).toContain('teal');

        const overwrite: ThemeAction = { type: 'add-basic', name: 'red', hex: '#cc0000' };
        expect(confirmationFor(added, overwrite)).not.toBeNull();
        const overwritten = themeDraftReducer(added, overwrite);
        expect(basic(overwritten, 'red')).toMatchObject({ preset: true, hex: '#cc0000' });
        expect(overwritten.basics).toHaveLength(12);

        const removed = run(
            { type: 'add-basic', name: 'teal', hex: '#00a3a3' },
            { type: 'remove-basic', name: 'teal' },
            { type: 'remove-basic', name: 'red' },
        );
        expect(removed.basics.map((p) => p.name)).toEqual(initialDraft.basics.map((p) => p.name));
    });

    it('ignores invalid names and HEX', () => {
        expect(
            run(
                { type: 'add-basic', name: 'Teal', hex: '#00a3a3' },
                { type: 'add-basic', name: 'gray', hex: '#00a3a3' },
                { type: 'add-basic', name: 'teal', hex: '#00a3a' },
                { type: 'set-brand', name: '1brand', hex: '#00a3a3' },
            ),
        ).toEqual(initialDraft);
    });

    it('makes the brand primary, routes its hue edits, and keeps them until its HEX changes', () => {
        const draft = run(
            { type: 'set-brand', name: 'acme', hex: '#7A3CFF' },
            { type: 'set-hue', name: 'acme', scale: '900', hue: 280 },
        );
        expect(primaryName(draft)).toBe('acme');
        expect(draftToOptions(draft)).toMatchObject({
            brandColor: { name: 'acme', hexcode: '#7a3cff' },
            hueOverrides: { acme: { '900': 280 } },
        });
        expect(generate(draft).brand?.name).toBe('acme');

        const renamed = themeDraftReducer(draft, {
            type: 'set-brand',
            name: 'acme',
            hex: '#7a3cff',
        });
        expect(renamed.brand!.hues).toEqual({ '900': 280 });

        const recolor: ThemeAction = { type: 'set-brand', name: 'acme', hex: '#00a3a3' };
        expect(confirmationFor(draft, recolor)).not.toBeNull();
        expect(themeDraftReducer(draft, recolor).brand!.hues).toEqual({});
        expect(themeDraftReducer(draft, { type: 'clear-brand' }).brand).toBeNull();
    });

    it('builds the same palettes as the engine given the same options', () => {
        // Untouched, the plugin draft builds the engine's default palettes exactly.
        expect(generate(initialDraft)).toEqual(generatePrimitiveColorPalette());

        const draft = run(
            { type: 'set-hex', name: 'red', hex: '#E8202F' },
            { type: 'add-basic', name: 'teal', hex: '#00838F' },
            { type: 'set-brand', name: 'acme', hex: '#7A3CFF' },
            { type: 'set-hue', name: 'teal', scale: '700', hue: 200.25 },
            { type: 'set-hue', name: 'acme', scale: '900', hue: 275 },
        );
        const engine = generatePrimitiveColorPalette({
            basicColors: [
                { name: 'red', hexcode: '#e8202f' },
                { name: 'teal', hexcode: '#00838f' },
            ],
            brandColor: { name: 'acme', hexcode: '#7a3cff' },
            hueOverrides: { teal: { '700': 200.25 }, acme: { '900': 275 } },
        });
        expect(generate(draft)).toEqual(engine);
    });

    it('shows each base color its own light 500 HEX by default', () => {
        const theme = generate(initialDraft);
        for (const p of initialDraft.basics)
            expect(chip(theme, 'light', p.name, '500').hex, p.name).toBe(p.hex);
    });

    it('clears every per-step hue of one palette', () => {
        const draft = run(
            { type: 'set-hue', name: 'red', scale: '500', hue: 10 },
            { type: 'set-hue', name: 'red', scale: '700', hue: 15 },
            { type: 'set-hue', name: 'blue', scale: '500', hue: 250 },
            { type: 'clear-hues', name: 'red' },
        );
        expect(basic(draft, 'red')!.hues).toEqual({});
        expect(basic(draft, 'blue')!.hues).toEqual({ '500': 250 });
    });

    it('asks before removing an added color that has hue edits', () => {
        const remove: ThemeAction = { type: 'remove-basic', name: 'teal' };
        const plain = run({ type: 'add-basic', name: 'teal', hex: '#00838f' });
        expect(confirmationFor(plain, remove)).toBeNull();

        const edited = themeDraftReducer(plain, {
            type: 'set-hue',
            name: 'teal',
            scale: '600',
            hue: 200,
        });
        expect(confirmationFor(edited, remove)).toMatch(/teal/);
        expect(basic(themeDraftReducer(edited, remove), 'teal')).toBeUndefined();
    });

    it.each(['constructor', 'gray', 'Teal', '1st'])('rejects the name %s', (name) => {
        expect(isValidName(name)).toBe(false);
        expect(run({ type: 'add-basic', name, hex: '#00838f' })).toEqual(initialDraft);
    });

    it('drops brand edits on rename, so no edit names a palette that is gone', () => {
        const draft = run(
            { type: 'set-brand', name: 'acme', hex: '#7a3cff' },
            { type: 'set-hue', name: 'acme', scale: '500', hue: 270 },
        );
        const rename: ThemeAction = { type: 'set-brand', name: 'other', hex: '#7a3cff' };
        expect(confirmationFor(draft, rename)).not.toBeNull();

        const renamed = themeDraftReducer(draft, rename);
        expect(renamed.brand).toMatchObject({ name: 'other', hues: {} });
        expect(draftToOptions(renamed).hueOverrides).toEqual({});
        expect(() => generate(renamed)).not.toThrow();
    });

    it('passes edits only for palettes the engine builds', () => {
        const draft = run(
            { type: 'add-basic', name: 'teal', hex: '#00a3a3' },
            { type: 'set-hue', name: 'teal', scale: '600', hue: 190 },
            { type: 'set-hue', name: 'blue', scale: '500', hue: 250 },
            { type: 'set-brand', name: 'blue', hex: '#2255ee' },
            { type: 'remove-basic', name: 'teal' },
        );
        expect(draftToOptions(draft).hueOverrides).toEqual({});
        expect(() => generate(draft)).not.toThrow();

        // The shadowed basic keeps its edits and gets them back once the brand is gone.
        const restored = themeDraftReducer(draft, { type: 'clear-brand' });
        expect(draftToOptions(restored).hueOverrides).toEqual({ blue: { '500': 250 } });
    });

    it('lets a brand replace a basic color of the same name without a duplicate', () => {
        const draft = run(
            { type: 'set-hex', name: 'blue', hex: '#0000ff' },
            { type: 'set-brand', name: 'blue', hex: '#2255ee' },
        );
        expect(draftToOptions(draft).basicColors).toEqual([]);
        expect(generate(draft).brand?.name).toBe('blue');
    });
});

describe('flaggedCells', () => {
    it('maps check details to cells, fail over warn', () => {
        const flags = flaggedCells([
            { id: 'a11y', status: 'warn', details: ['light my-brand-500 (text): 2.1 < 4.5'] },
            {
                id: 'chroma',
                status: 'fail',
                details: ['light my-brand-500: chroma 0.1 (rule 0.2)'],
            },
            { id: 'target-contrast', status: 'fail', details: ['dark red-050: 1.1 (target 1.2)'] },
            {
                id: 'hue-gap',
                status: 'warn',
                details: ['light red-700 · light orange-700: hue gap 1.0° (min 5.5°)'],
            },
            { id: 'primary-anchor', status: 'ok', details: [] },
        ]);
        expect(Object.fromEntries(flags)).toEqual({
            'light my-brand-500': 'fail',
            'dark red-050': 'fail',
            'light red-700': 'warn',
            'light orange-700': 'warn',
        });
    });
});
