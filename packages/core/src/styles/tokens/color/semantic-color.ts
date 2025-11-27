import type { BASE_BASIC_COLORS, LIGHT_BASIC_COLORS } from './basic-color';

type ColorPalette = typeof LIGHT_BASIC_COLORS;
type ColorName = Exclude<keyof ColorPalette, 'background' | 'black' | 'white'>;
type ColorShade = keyof ColorPalette['blue'];
type BaseColorName = keyof typeof BASE_BASIC_COLORS;
type BackgroundKey = keyof ColorPalette['background'];

const colorRef = <C extends ColorName, S extends ColorShade>(color: C, shade: S) =>
    `var(--vapor-color-${color}-${shade})` as const;

const baseRef = <C extends BaseColorName>(color: C) => `var(--vapor-color-${color})` as const;

const bgRef = <K extends BackgroundKey>(key: K) => `var(--vapor-color-background-${key})` as const;

export const LIGHT_SEMANTIC_COLORS = {
    background: {
        primary: {
            '100': colorRef('blue', '100'),
            '200': colorRef('blue', '500'),
        },
        secondary: {
            '100': colorRef('gray', '050'),
            '200': colorRef('gray', '100'),
        },
        success: {
            '100': colorRef('green', '100'),
            '200': colorRef('green', '500'),
        },
        warning: {
            '100': colorRef('orange', '100'),
            '200': colorRef('orange', '500'),
        },
        danger: {
            '100': colorRef('red', '100'),
            '200': colorRef('red', '500'),
        },
        hint: {
            '100': colorRef('gray', '100'),
            '200': colorRef('gray', '600'),
        },
        contrast: {
            '100': colorRef('gray', '300'),
            '200': colorRef('gray', '800'),
        },
        canvas: {
            '100': bgRef('canvas'),
            '200': colorRef('gray', '050'),
        },
        overlay: {
            '100': bgRef('canvas'),
        },
    },
    foreground: {
        primary: {
            '100': colorRef('blue', '600'),
            '200': colorRef('blue', '700'),
        },
        secondary: {
            '100': colorRef('gray', '800'),
            '200': colorRef('gray', '900'),
        },
        success: {
            '100': colorRef('green', '600'),
            '200': colorRef('green', '700'),
        },
        warning: {
            '100': colorRef('orange', '600'),
            '200': colorRef('orange', '700'),
        },
        danger: {
            '100': colorRef('red', '600'),
            '200': colorRef('red', '700'),
        },
        hint: {
            '100': colorRef('gray', '600'),
            '200': colorRef('gray', '700'),
        },
        contrast: {
            '100': colorRef('gray', '800'),
            '200': colorRef('gray', '900'),
        },
        normal: {
            '100': colorRef('gray', '700'),
            '200': colorRef('gray', '900'),
        },
        inverse: baseRef('white'),
    },
    border: {
        normal: colorRef('gray', '100'),
        primary: colorRef('blue', '500'),
        secondary: colorRef('gray', '400'),
        success: colorRef('green', '500'),
        warning: colorRef('orange', '500'),
        danger: colorRef('red', '500'),
        hint: colorRef('gray', '600'),
        contrast: colorRef('gray', '800'),
    },
};

export const DARK_SEMANTIC_COLORS = {
    background: {
        primary: {
            '100': colorRef('blue', '050'),
            '200': colorRef('blue', '500'),
        },
        secondary: {
            '100': colorRef('gray', '050'),
            '200': colorRef('gray', '200'),
        },
        success: {
            '100': colorRef('green', '050'),
            '200': colorRef('green', '500'),
        },
        warning: {
            '100': colorRef('orange', '050'),
            '200': colorRef('orange', '500'),
        },
        danger: {
            '100': colorRef('red', '050'),
            '200': colorRef('red', '500'),
        },
        hint: {
            '100': colorRef('gray', '100'),
            '200': colorRef('gray', '600'),
        },
        contrast: {
            '100': colorRef('gray', '800'),
            '200': colorRef('gray', '300'),
        },
        canvas: {
            '100': bgRef('canvas'),
            '200': colorRef('gray', '050'),
        },
        overlay: {
            '100': colorRef('gray', '100'),
        },
    },
    foreground: {
        primary: {
            '100': colorRef('blue', '600'),
            '200': colorRef('blue', '700'),
        },
        secondary: {
            '100': colorRef('gray', '700'),
            '200': colorRef('gray', '900'),
        },
        success: {
            '100': colorRef('green', '600'),
            '200': colorRef('green', '700'),
        },
        warning: {
            '100': colorRef('orange', '600'),
            '200': colorRef('orange', '700'),
        },
        danger: {
            '100': colorRef('red', '600'),
            '200': colorRef('red', '700'),
        },
        hint: {
            '100': colorRef('gray', '600'),
            '200': colorRef('gray', '700'),
        },
        contrast: {
            '100': colorRef('gray', '200'),
            '200': colorRef('gray', '300'),
        },
        normal: {
            '100': colorRef('gray', '700'),
            '200': colorRef('gray', '900'),
        },
        inverse: baseRef('white'),
    },
    border: {
        normal: colorRef('gray', '300'),
        primary: colorRef('blue', '400'),
        secondary: colorRef('gray', '400'),
        success: colorRef('green', '400'),
        warning: colorRef('orange', '400'),
        danger: colorRef('red', '400'),
        hint: colorRef('gray', '400'),
        contrast: colorRef('gray', '400'),
    },
};
