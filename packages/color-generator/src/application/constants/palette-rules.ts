/**
 * Inputs of the reference script (`reference/generate_palette.py`), copied as tables.
 * Change the script first, then these values and the fixtures.
 */
import type { ColorScale, Mode, Scale } from '../../domain/models/scale';

/** Fixed reference backgrounds, 6-digit uppercase HEX without `#`. */
export const BG: Record<Mode, string> = { light: 'FFFFFF', dark: '232323' };

/** Target contrast against `BG[mode]` (Figma table v2). 000 and 025 apply to gray only. */
export const TARGET_CONTRAST: Record<Mode, Record<Scale, number>> = {
    light: {
        '000': 1.0,
        '025': 1.071,
        '050': 1.14,
        '100': 1.308,
        '200': 1.708,
        '300': 2.27,
        '400': 3.234,
        '500': 4.881,
        '600': 6.585,
        '700': 8.587,
        '800': 11.549,
        '900': 15.134,
    },
    dark: {
        '000': 1.096,
        '025': 1.0,
        '050': 1.12,
        '100': 1.35,
        '200': 1.75,
        '300': 2.3,
        '400': 3.42,
        '500': 5.25,
        '600': 6.8,
        '700': 8.6,
        '800': 10.9,
        '900': 13.5,
    },
};

/** Every light cell sits darker than white; in dark mode only gray 000 sits darker than the background. */
export const isDarkerThanBg = (mode: Mode, scale: Scale) => mode === 'light' || scale === '000';

/** `'self'` is the cell's own color. */
export interface A11yRule {
    mode: Mode;
    scale: ColorScale;
    fg: string;
    bg: string;
    min: number;
    label: string;
}

export const A11Y_RULES: A11yRule[] = [
    {
        mode: 'light',
        scale: '400',
        fg: 'self',
        bg: 'FFFFFF',
        min: 3.0,
        label: 'border/icon on white',
    },
    {
        mode: 'light',
        scale: '400',
        fg: 'self',
        bg: 'F7F7F7',
        min: 3.0,
        label: 'border/icon on card (gray-025)',
    },
    {
        mode: 'light',
        scale: '500',
        fg: 'self',
        bg: 'FFFFFF',
        min: 4.5,
        label: 'text on white, white text on fill button',
    },
    {
        mode: 'light',
        scale: '500',
        fg: 'self',
        bg: 'F7F7F7',
        min: 4.5,
        label: 'text on card (gray-025)',
    },
    {
        mode: 'dark',
        scale: '400',
        fg: 'self',
        bg: '232323',
        min: 3.0,
        label: 'border on base (gray-025)',
    },
    {
        mode: 'dark',
        scale: '400',
        fg: 'self',
        bg: '2C2C2C',
        min: 3.0,
        label: 'border on popover (gray-050)',
    },
    {
        mode: 'dark',
        scale: '400',
        fg: 'FFFFFF',
        bg: 'self',
        min: 4.5,
        label: 'white text on fill button',
    },
    {
        mode: 'dark',
        scale: '500',
        fg: 'self',
        bg: '232323',
        min: 4.5,
        label: 'text on base (gray-025)',
    },
    {
        mode: 'dark',
        scale: '500',
        fg: 'self',
        bg: '2C2C2C',
        min: 4.5,
        label: 'text on popover (gray-050)',
    },
];

/** Key colors of the 11 base colors. Hues come from white → keys → black interpolation. */
export const LEONARDO_KEYS: Record<string, [string, string, string]> = {
    red: ['F8636A', 'BB1225', '9E0006'],
    orange: ['EF6F25', 'B72100', '9E0000'],
    yellow: ['FBBD05', '8D4F00', '4D1100'],
    pink: ['F26394', 'B5135D', '550016'],
    grape: ['D06BEA', '9A1CB7', '62007E'],
    violet: ['D9B9FF', '805CEC', '4805A3'],
    blue: ['8DCDFF', '2A72E5', '000E84'],
    cobalt: ['136EFC', '0009C2', '17008A'],
    cyan: ['1BB3CC', '04819C', '002941'],
    green: ['75D9B4', '058765', '002E13'],
    lime: ['9AD84A', '71B61A', '115A00'],
};

export const BASE_COLORS = Object.keys(LEONARDO_KEYS);

/** A color whose 200 hue falls in this range (degrees) belongs to the yellow family. */
export const YELLOW_FAMILY_RANGE: [number, number] = [60, 150];

export const DARK_400_CHROMA_FACTOR = 0.9;

/** Passing this chroma applies the largest chroma sRGB can express. */
export const EXPRESSIBLE_MAX = 0.6;

/** Scales whose chroma is capped by the base colors (050–200). */
export const CAPPED_SCALES: ColorScale[] = ['050', '100', '200'];
