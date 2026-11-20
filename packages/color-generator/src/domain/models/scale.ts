export const SCALES = [
    '000',
    '025',
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
] as const;
export type Scale = (typeof SCALES)[number];

/** Chromatic palettes use 050–900; only gray has 000 and 025. */
export const COLOR_SCALES = SCALES.slice(2) as Exclude<Scale, '000' | '025'>[];
export type ColorScale = (typeof COLOR_SCALES)[number];

export type Mode = 'light' | 'dark';
export const MODES: Mode[] = ['light', 'dark'];
