/**
 * Inputs of the reference script (`reference/generate_palette.py`), copied as tables.
 * Change the script first, then these values and the fixtures.
 */
import type { ColorScale, Mode, Scale } from '../../domain/models/scale';
import type { HueAnchors } from '../../domain/models/theme';

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

/**
 * Light hues (degrees) at 050, 600 and 900 of the 11 base colors; the other steps follow the
 * curve through them. Dark warm steps carry the designer's corrections (red 900, orange 600 and
 * 900, yellow 900).
 */
export const HUE_ANCHORS: Record<string, HueAnchors> = {
    red: { '050': 20.46, '600': 24.35, '900': 23.0 },
    orange: { '050': 45.9, '600': 35.9, '900': 40.1 },
    yellow: { '050': 84.5, '600': 61.28, '900': 49.3 },
    pink: { '050': 1.66, '600': 1.74, '900': 15.78 },
    grape: { '050': 319.05, '600': 318.69, '900': 315.66 },
    violet: { '050': 305.18, '600': 290.03, '900': 289.98 },
    blue: { '050': 242.82, '600': 261.07, '900': 264.21 },
    cobalt: { '050': 260.28, '600': 261.88, '900': 270.78 },
    cyan: { '050': 212.77, '600': 225.72, '900': 240.55 },
    green: { '050': 167.48, '600': 162.73, '900': 152.19 },
    lime: { '050': 129.92, '600': 139.16, '900': 140.86 },
};

export const BASE_COLORS = Object.keys(HUE_ANCHORS);

/**
 * Former Leonardo key colors of the base colors. They no longer shape any hue; the Figma plugin
 * still reads the middle key as each base color's default input HEX.
 */
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

/** Light 500–900 chroma stays within this multiple of its neighbours' mean (900: of 800). */
export const CHROMA_SPIKE_FACTOR = 1.1;

/** A color whose 200 hue falls in this range (degrees) belongs to the yellow family. */
export const YELLOW_FAMILY_RANGE: [number, number] = [60, 150];

export const DARK_400_CHROMA_FACTOR = 0.9;

/** Passing this chroma applies the largest chroma sRGB can express. */
export const EXPRESSIBLE_MAX = 0.6;

/** Scales whose chroma is capped by the base colors (050–200). */
export const CAPPED_SCALES: ColorScale[] = ['050', '100', '200'];
