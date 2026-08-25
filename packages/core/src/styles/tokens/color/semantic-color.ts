import type { BASE_BASIC_COLORS, LIGHT_BASIC_COLORS } from './basic-color';

/** 색상 이름 타입 (background, black, white 제외) */
type ColorName = Exclude<keyof typeof LIGHT_BASIC_COLORS, 'background' | 'black' | 'white'>;

/** 색상 단계(shade) 타입 */
type ColorShade = keyof (typeof LIGHT_BASIC_COLORS)['blue'];
type GrayColorShade = keyof (typeof LIGHT_BASIC_COLORS)['gray'];

/** 기본 색상 이름 타입 (black, white) */
type BaseColorName = keyof typeof BASE_BASIC_COLORS;

const colorRef = <C extends ColorName, S extends (C extends 'gray' ? GrayColorShade : ColorShade)>(
    color: C,
    shade: S,
) => `var(--vapor-color-${color}-${shade})` as const;

const baseRef = <C extends BaseColorName>(color: C) => `var(--vapor-color-${color})` as const;

const canvasRef = () => `var(--vapor-color-canvas)` as const;

export const LIGHT_SEMANTIC_COLORS = {
    background: {
        // primary
        'primary-100': colorRef('blue', '100'),
        'primary-200': colorRef('blue', '500'),
        'primary-weak': colorRef('blue', '100'),
        primary: colorRef('blue', '500'),

        // secondary
        'secondary-100': colorRef('gray', '050'),
        'secondary-200': colorRef('gray', '100'),
        'secondary-weak': colorRef('gray', '050'),
        secondary: colorRef('gray', '100'),

        // success
        'success-100': colorRef('green', '100'),
        'success-200': colorRef('green', '500'),
        'success-weak': colorRef('green', '100'),
        success: colorRef('green', '500'),

        // warning
        'warning-100': colorRef('orange', '100'),
        'warning-200': colorRef('orange', '500'),
        'warning-weak': colorRef('orange', '100'),
        warning: colorRef('orange', '500'),

        // danger
        'danger-100': colorRef('red', '100'),
        'danger-200': colorRef('red', '500'),
        'danger-weak': colorRef('red', '100'),
        danger: colorRef('red', '500'),

        // hint
        'hint-100': colorRef('gray', '100'),
        'hint-200': colorRef('gray', '600'),
        'hint-weak': colorRef('gray', '100'),
        hint: colorRef('gray', '600'),

        // contrast
        'contrast-100': colorRef('gray', '300'),
        'contrast-200': colorRef('gray', '800'),
        'contrast-weak': colorRef('gray', '500'),
        contrast: colorRef('gray', '800'),

        // canvas
        'canvas-100': canvasRef(),
        'canvas-200': colorRef('gray', '050'),
        'overlay-100': canvasRef(),
        'canvas-base': baseRef('white'),
        'canvas-sunken': colorRef('gray', '050'),
        'canvas-raised': colorRef('gray', '025'),
        'canvas-dim': baseRef('black'),
        'canvas-overlay': baseRef('white'),
        'canvas-inverse': colorRef('gray', '800'),
    },
    foreground: {
        // primary
        'primary-100': colorRef('blue', '600'),
        'primary-200': colorRef('blue', '700'),
        primary: colorRef('blue', '600'),
        'primary-strong': colorRef('blue', '700'),

        // secondary
        'secondary-100': colorRef('gray', '800'),
        'secondary-200': colorRef('gray', '900'),
        secondary: colorRef('gray', '700'),

        // success
        'success-100': colorRef('green', '600'),
        'success-200': colorRef('green', '700'),
        success: colorRef('green', '600'),
        'success-strong': colorRef('green', '700'),

        // warning
        'warning-100': colorRef('orange', '600'),
        'warning-200': colorRef('orange', '700'),
        warning: colorRef('orange', '600'),
        'warning-strong': colorRef('orange', '700'),

        // danger
        'danger-100': colorRef('red', '600'),
        'danger-200': colorRef('red', '700'),
        danger: colorRef('red', '600'),
        'danger-strong': colorRef('red', '700'),

        // hint
        'hint-100': colorRef('gray', '600'),
        'hint-200': colorRef('gray', '700'),
        hint: colorRef('gray', '500'),

        // contrast
        'contrast-100': colorRef('gray', '800'),
        'contrast-200': colorRef('gray', '900'),
        contrast: baseRef('black'),

        // normal
        'normal-100': colorRef('gray', '700'),
        'normal-200': colorRef('gray', '900'),
        normal: colorRef('gray', '900'),

        // inverse
        inverse: baseRef('white'),

        // static
        staticWhite: baseRef('white'),
        staticBlack: baseRef('black'),
    },
    border: {
        normal: colorRef('gray', '100'),
        primary: colorRef('blue', '500'),
        secondary: colorRef('gray', '200'),
        success: colorRef('green', '500'),
        warning: colorRef('orange', '500'),
        danger: colorRef('red', '500'),
        hint: colorRef('gray', '600'),
        contrast: colorRef('gray', '800'),
    },
};

export const DARK_SEMANTIC_COLORS = {
    background: {
        // primary
        'primary-100': colorRef('blue', '050'),
        'primary-200': colorRef('blue', '500'),
        'primary-weak': colorRef('blue', '100'),
        primary: colorRef('blue', '500'),

        // secondary
        'secondary-100': colorRef('gray', '050'),
        'secondary-200': colorRef('gray', '200'),
        'secondary-weak': colorRef('gray', '100'),
        secondary: colorRef('gray', '200'),

        // success
        'success-100': colorRef('green', '050'),
        'success-200': colorRef('green', '500'),
        'success-weak': colorRef('green', '100'),
        success: colorRef('green', '500'),

        // warning
        'warning-100': colorRef('orange', '050'),
        'warning-200': colorRef('orange', '500'),
        'warning-weak': colorRef('orange', '100'),
        warning: colorRef('orange', '500'),

        // danger
        'danger-100': colorRef('red', '050'),
        'danger-200': colorRef('red', '500'),
        'danger-weak': colorRef('red', '100'),
        danger: colorRef('red', '500'),

        // hint
        'hint-100': colorRef('gray', '200'),
        'hint-200': colorRef('gray', '600'),
        'hint-weak': colorRef('gray', '200'),
        hint: colorRef('gray', '600'),

        // contrast
        'contrast-100': colorRef('gray', '800'),
        'contrast-200': colorRef('gray', '300'),
        'contrast-weak': colorRef('gray', '700'),
        contrast: colorRef('gray', '800'),

        // canvas
        'canvas-100': colorRef('gray', '050'),
        'canvas-200': colorRef('gray', '025'),
        'overlay-100': colorRef('gray', '100'),
        'canvas-base': colorRef('gray', '050'),
        'canvas-sunken': colorRef('gray', '025'),
        'canvas-raised': colorRef('gray', '100'),
        'canvas-dim': baseRef('black'),
        'canvas-overlay': colorRef('gray', '100'),
        'canvas-inverse': colorRef('gray', '900'),
    },
    foreground: {
        // primary
        'primary-100': colorRef('blue', '600'),
        'primary-200': colorRef('blue', '700'),
        primary: colorRef('blue', '600'),
        'primary-strong': colorRef('blue', '700'),

        // secondary
        'secondary-100': colorRef('gray', '700'),
        'secondary-200': colorRef('gray', '900'),
        secondary: colorRef('gray', '700'),

        // success
        'success-100': colorRef('green', '600'),
        'success-200': colorRef('green', '700'),
        success: colorRef('green', '600'),
        'success-strong': colorRef('green', '700'),

        // warning
        'warning-100': colorRef('orange', '600'),
        'warning-200': colorRef('orange', '700'),
        warning: colorRef('orange', '600'),
        'warning-strong': colorRef('orange', '700'),

        // danger
        'danger-100': colorRef('red', '600'),
        'danger-200': colorRef('red', '700'),
        danger: colorRef('red', '600'),
        'danger-strong': colorRef('red', '700'),

        // hint
        'hint-100': colorRef('gray', '600'),
        'hint-200': colorRef('gray', '700'),
        hint: colorRef('gray', '500'),

        // contrast
        'contrast-100': colorRef('gray', '200'),
        'contrast-200': colorRef('gray', '300'),
        contrast: baseRef('white'),

        // normal
        'normal-100': colorRef('gray', '700'),
        'normal-200': colorRef('gray', '900'),
        normal: colorRef('gray', '900'),

        // inverse
        inverse: baseRef('black'),

        // static
        staticWhite: baseRef('white'),
        staticBlack: baseRef('black'),
    },
    border: {
        normal: colorRef('gray', '300'),
        primary: colorRef('blue', '400'),
        secondary: colorRef('gray', '200'),
        success: colorRef('green', '400'),
        warning: colorRef('orange', '400'),
        danger: colorRef('red', '400'),
        hint: colorRef('gray', '400'),
        contrast: colorRef('gray', '400'),
    },
};
