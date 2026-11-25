import type { HueAnchors, PaletteCheck, Scale, ThemeOptions } from '@vapor-ui/color-generator';
import { BASE_COLOR_HEX } from '@vapor-ui/color-generator';

/* -------------------------------------------------------------------------------------------------
 * Model
 * -----------------------------------------------------------------------------------------------*/

/** Light scales a designer can rotate. Gray and 000/025 have no hue to edit. */
export const COLOR_SCALES = [
    '050',
    '100',
    '200',
    '300',
    '400',
    '500',
    '600',
    '700',
    '800',
    '900',
] as const satisfies readonly Scale[];

/** Absolute light OKLCH hue per scale, only for the cells the designer rotated. */
export type Hues = Partial<Record<Scale, number>>;

/** Light hue anchors the designer moved, absolute and wrapped into 0–360. */
export type Anchors = Partial<HueAnchors>;
export type AnchorStep = keyof HueAnchors;
export const ANCHOR_STEPS = ['050', '600', '900'] as const satisfies readonly AnchorStep[];

/** A palette's hue edits: its anchors shape the whole curve, `hues` pin single cells on top. */
type Edits = { hues: Hues; anchors: Anchors };
const NO_EDITS: Edits = { hues: {}, anchors: {} };

export type PaletteDraft = { name: string; hex: string; preset: boolean } & Edits;
export type BrandDraft = { name: string; hex: string } & Edits;
export type ThemeDraft = { basics: PaletteDraft[]; brand: BrandDraft | null };

export type ThemeAction =
    | { type: 'set-hex'; name: string; hex: string }
    | { type: 'add-basic'; name: string; hex: string }
    | { type: 'remove-basic'; name: string }
    /** `hue: null` resets the cell to the generated hue. */
    | { type: 'set-hue'; name: string; scale: Scale; hue: number | null }
    /** `hue: null` resets the anchor to the default or HEX-derived one. */
    | { type: 'set-anchor'; name: string; step: AnchorStep; hue: number | null }
    | { type: 'clear-hues'; name: string }
    | { type: 'set-brand'; name: string; hex: string }
    | { type: 'clear-brand' };

/** Hue edits stay within this many degrees of the generated hue. */
export const HUE_RANGE = 30;

const NAME_PATTERN = /^[a-z][a-z0-9-]*$/;
const HEX_PATTERN = /^#[0-9a-f]{6}$/;

// The engine reserves `gray` and throws on it.
export const isValidName = (name: string) => NAME_PATTERN.test(name) && name !== 'gray';
export const isHex = (hex: string) => HEX_PATTERN.test(hex);

const PRESET_HEX: Record<string, string> = Object.fromEntries(
    Object.entries(BASE_COLOR_HEX).map(([name, hex]) => [name, hex.toLowerCase()]),
);

export const initialDraft: ThemeDraft = {
    basics: Object.entries(PRESET_HEX).map(([name, hex]) => ({
        name,
        hex,
        preset: true,
        ...NO_EDITS,
    })),
    brand: null,
};

/* -------------------------------------------------------------------------------------------------
 * Transitions
 * -----------------------------------------------------------------------------------------------*/

export const hasHues = (palette: { hues: Hues }) => Object.keys(palette.hues).length > 0;
const hasEdits = (palette: Edits) => hasHues(palette) || Object.keys(palette.anchors).length > 0;

export const normalizeHue = (hue: number) => ((hue % 360) + 360) % 360;

const withHue = <K extends string>(
    hues: Partial<Record<K, number>>,
    key: K,
    hue: number | null,
): Partial<Record<K, number>> => {
    const { [key]: _, ...rest } = hues;
    return (hue === null ? rest : { ...rest, [key]: normalizeHue(hue) }) as Partial<
        Record<K, number>
    >;
};

const mapBasic = (draft: ThemeDraft, name: string, update: (p: PaletteDraft) => PaletteDraft) => ({
    ...draft,
    basics: draft.basics.map((p) => (p.name === name ? update(p) : p)),
});

/** Edits a palette's hues; the brand replaces a basic palette of the same name, so it wins. */
const mapEdits = (draft: ThemeDraft, name: string, update: (e: Edits) => Edits): ThemeDraft =>
    draft.brand?.name === name
        ? { ...draft, brand: { ...draft.brand, ...update(draft.brand) } }
        : mapBasic(draft, name, (p) => ({ ...p, ...update(p) }));

export function themeDraftReducer(draft: ThemeDraft, action: ThemeAction): ThemeDraft {
    switch (action.type) {
        case 'set-hex': {
            const hex = action.hex.toLowerCase();
            if (!isHex(hex)) return draft;
            // A new base HEX moves the whole curve, so this palette's hue edits no longer apply.
            return mapBasic(draft, action.name, (p) =>
                p.hex === hex ? p : { ...p, hex, ...NO_EDITS },
            );
        }
        case 'add-basic': {
            const hex = action.hex.toLowerCase();
            if (!isValidName(action.name) || !isHex(hex)) return draft;
            if (draft.basics.some((p) => p.name === action.name))
                return mapBasic(draft, action.name, (p) => ({ ...p, hex, ...NO_EDITS }));
            return {
                ...draft,
                basics: [...draft.basics, { name: action.name, hex, preset: false, ...NO_EDITS }],
            };
        }
        case 'remove-basic':
            return {
                ...draft,
                basics: draft.basics.filter((p) => p.preset || p.name !== action.name),
            };
        case 'set-hue':
            return mapEdits(draft, action.name, (e) => ({
                ...e,
                hues: withHue(e.hues, action.scale, action.hue),
            }));
        case 'set-anchor':
            return mapEdits(draft, action.name, (e) => ({
                ...e,
                anchors: withHue(e.anchors, action.step, action.hue),
            }));
        case 'clear-hues':
            return mapEdits(draft, action.name, (e) => ({ ...e, hues: {} }));
        case 'set-brand': {
            const hex = action.hex.toLowerCase();
            if (!isValidName(action.name) || !isHex(hex)) return draft;
            const { brand } = draft;
            // Edits belong to one brand: a new HEX moves its curve, a new name is another palette.
            const keep = brand?.hex === hex && brand.name === action.name;
            return { ...draft, brand: { name: action.name, hex, ...(keep ? brand : NO_EDITS) } };
        }
        case 'clear-brand':
            return { ...draft, brand: null };
    }
}

/**
 * Asks before an action that drops hue edits or overwrites a palette; `null` when it loses
 * nothing.
 */
export function confirmationFor(draft: ThemeDraft, action: ThemeAction): string | null {
    const basic = (name: string) => draft.basics.find((p) => p.name === name);
    switch (action.type) {
        case 'set-hex': {
            const p = basic(action.name);
            return p && hasEdits(p) && p.hex !== action.hex.toLowerCase()
                ? `${p.name}의 대표 색을 바꾸면 색조 편집이 초기화돼요.`
                : null;
        }
        case 'add-basic':
            return basic(action.name)
                ? `${action.name} 색이 이미 있어요. 새 HEX로 덮어쓰고 색조 편집을 초기화할까요?`
                : null;
        case 'set-brand':
            return draft.brand &&
                hasEdits(draft.brand) &&
                (draft.brand.hex !== action.hex.toLowerCase() || draft.brand.name !== action.name)
                ? '브랜드 색이나 이름을 바꾸면 브랜드 색조 편집이 초기화돼요.'
                : null;
        case 'clear-brand':
            return draft.brand && hasEdits(draft.brand)
                ? '브랜드를 지우면 브랜드 색조 편집도 사라져요.'
                : null;
        default:
            return null;
    }
}

/* -------------------------------------------------------------------------------------------------
 * Draft → engine
 * -----------------------------------------------------------------------------------------------*/

/** The primary palette for semantic tokens: the brand, or `blue` without one. */
export const primaryName = (draft: ThemeDraft) => draft.brand?.name ?? 'blue';

export function draftToOptions(draft: ThemeDraft): ThemeOptions {
    const { brand } = draft;
    // The engine throws when a basic color and the brand share a name; the brand replaces it.
    const basics = draft.basics.filter((p) => p.name !== brand?.name);
    // An unchanged preset passes no HEX: one HEX rederives the key colors and shifts the palette.
    const basicColors = basics
        .filter((p) => !p.preset || p.hex !== PRESET_HEX[p.name])
        .map((p) => ({ name: p.name, hexcode: p.hex }));
    // Only palettes the engine builds: it throws on edits for any other name.
    const built = [...basics, ...(brand ? [brand] : [])];
    const editsOf = (key: keyof Edits) =>
        Object.fromEntries(
            built.filter((p) => Object.keys(p[key]).length > 0).map((p) => [p.name, p[key]]),
        );
    return {
        basicColors,
        hueAnchors: editsOf('anchors'),
        hueOverrides: editsOf('hues'),
        ...(brand && { brandColor: { name: brand.name, hexcode: brand.hex } }),
    };
}

/** The same draft with every per-step hue dropped: the theme each step slider centers on. */
export const withoutHues = (draft: ThemeDraft): ThemeDraft => ({
    basics: draft.basics.map((p) => ({ ...p, hues: {} })),
    brand: draft.brand && { ...draft.brand, hues: {} },
});

/** The same draft with no hue edits at all: its anchors are what each anchor slider resets to. */
export const withoutEdits = (draft: ThemeDraft): ThemeDraft => ({
    basics: draft.basics.map((p) => ({ ...p, ...NO_EDITS })),
    brand: draft.brand && { ...draft.brand, ...NO_EDITS },
});

/* -------------------------------------------------------------------------------------------------
 * Engine → UI
 * -----------------------------------------------------------------------------------------------*/

/** Hue of a chip's `oklch(L C H)` string. */
export const hueOf = (oklch: string) => Number(oklch.slice(6, -1).split(' ')[2]);

/** Signed shortest rotation from `from` to `to`, in (-180, 180]. */
export const hueDelta = (from: number, to: number) => {
    const d = normalizeHue(to - from);
    return d > 180 ? d - 360 : d;
};

/** Cells a check detail names, as `light blue-500`, with the worst status that names them. */
export function flaggedCells(checks: PaletteCheck[]): Map<string, 'warn' | 'fail'> {
    const flags = new Map<string, 'warn' | 'fail'>();
    for (const check of checks) {
        if (check.status === 'ok') continue;
        for (const detail of check.details)
            for (const [cell] of detail.matchAll(/\b(?:light|dark) [a-z][a-z0-9-]*-\d{3}\b/g))
                if (flags.get(cell) !== 'fail') flags.set(cell, check.status);
    }
    return flags;
}
