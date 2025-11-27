import { BASE_BASIC_COLORS, DARK_BASIC_COLORS, LIGHT_BASIC_COLORS } from './basic-color';

export const LIGHT_SEMANTIC_COLORS = {
    background: {
        primary: {
            '100': LIGHT_BASIC_COLORS.blue['100'],
            '200': LIGHT_BASIC_COLORS.blue['500'],
        },
        secondary: {
            '100': LIGHT_BASIC_COLORS.gray['050'],
            '200': LIGHT_BASIC_COLORS.gray['100'],
        },
        success: {
            '100': LIGHT_BASIC_COLORS.green['100'],
            '200': LIGHT_BASIC_COLORS.green['500'],
        },
        warning: {
            '100': LIGHT_BASIC_COLORS.orange['100'],
            '200': LIGHT_BASIC_COLORS.orange['500'],
        },
        danger: {
            '100': LIGHT_BASIC_COLORS.red['100'],
            '200': LIGHT_BASIC_COLORS.red['500'],
        },
        hint: {
            '100': LIGHT_BASIC_COLORS.gray['100'],
            '200': LIGHT_BASIC_COLORS.gray['600'],
        },
        contrast: {
            '100': LIGHT_BASIC_COLORS.gray['300'],
            '200': LIGHT_BASIC_COLORS.gray['800'],
        },
        canvas: {
            '100': LIGHT_BASIC_COLORS.background.canvas,
            '200': LIGHT_BASIC_COLORS.gray['050'],
        },
        overlay: {
            '100': LIGHT_BASIC_COLORS.background.canvas,
        },
    },
    foreground: {
        primary: {
            '100': LIGHT_BASIC_COLORS.blue['600'],
            '200': LIGHT_BASIC_COLORS.blue['700'],
        },
        secondary: {
            '100': LIGHT_BASIC_COLORS.gray['800'],
            '200': LIGHT_BASIC_COLORS.gray['900'],
        },
        success: {
            '100': LIGHT_BASIC_COLORS.green['600'],
            '200': LIGHT_BASIC_COLORS.green['700'],
        },
        warning: {
            '100': LIGHT_BASIC_COLORS.orange['600'],
            '200': LIGHT_BASIC_COLORS.orange['700'],
        },
        danger: {
            '100': LIGHT_BASIC_COLORS.red['600'],
            '200': LIGHT_BASIC_COLORS.red['700'],
        },
        hint: {
            '100': LIGHT_BASIC_COLORS.gray['600'],
            '200': LIGHT_BASIC_COLORS.gray['700'],
        },
        contrast: {
            '100': LIGHT_BASIC_COLORS.gray['800'],
            '200': LIGHT_BASIC_COLORS.gray['900'],
        },
        normal: {
            '100': LIGHT_BASIC_COLORS.gray['700'],
            '200': LIGHT_BASIC_COLORS.gray['900'],
        },
        inverse: BASE_BASIC_COLORS.white,
    },
    border: {
        normal: LIGHT_BASIC_COLORS.gray['100'],
        primary: LIGHT_BASIC_COLORS.blue['500'],
        secondary: LIGHT_BASIC_COLORS.gray['400'],
        success: LIGHT_BASIC_COLORS.green['500'],
        warning: LIGHT_BASIC_COLORS.orange['500'],
        danger: LIGHT_BASIC_COLORS.red['500'],
        hint: LIGHT_BASIC_COLORS.gray['600'],
        contrast: LIGHT_BASIC_COLORS.gray['800'],
    },
};

export const DARK_SEMANTIC_COLORS = {
    background: {
        primary: {
            '100': DARK_BASIC_COLORS.blue['050'],
            '200': DARK_BASIC_COLORS.blue['500'],
        },
        secondary: {
            '100': DARK_BASIC_COLORS.gray['050'],
            '200': DARK_BASIC_COLORS.gray['200'],
        },
        success: {
            '100': DARK_BASIC_COLORS.green['050'],
            '200': DARK_BASIC_COLORS.green['500'],
        },
        warning: {
            '100': DARK_BASIC_COLORS.orange['050'],
            '200': DARK_BASIC_COLORS.orange['500'],
        },
        danger: {
            '100': DARK_BASIC_COLORS.red['050'],
            '200': DARK_BASIC_COLORS.red['500'],
        },
        hint: {
            '100': DARK_BASIC_COLORS.gray['100'],
            '200': DARK_BASIC_COLORS.gray['600'],
        },
        contrast: {
            '100': DARK_BASIC_COLORS.gray['800'],
            '200': DARK_BASIC_COLORS.gray['300'],
        },
        canvas: {
            '100': DARK_BASIC_COLORS.background.canvas,
            '200': DARK_BASIC_COLORS.gray['050'],
        },
        overlay: { '100': DARK_BASIC_COLORS.gray['100'] },
    },
    foreground: {
        primary: {
            '100': DARK_BASIC_COLORS.blue['600'],
            '200': DARK_BASIC_COLORS.blue['700'],
        },
        secondary: {
            '100': DARK_BASIC_COLORS.gray['700'],
            '200': DARK_BASIC_COLORS.gray['900'],
        },
        success: {
            '100': DARK_BASIC_COLORS.green['600'],
            '200': DARK_BASIC_COLORS.green['700'],
        },
        warning: {
            '100': DARK_BASIC_COLORS.orange['600'],
            '200': DARK_BASIC_COLORS.orange['700'],
        },
        danger: {
            '100': DARK_BASIC_COLORS.red['600'],
            '200': DARK_BASIC_COLORS.red['700'],
        },
        hint: {
            '100': DARK_BASIC_COLORS.gray['600'],
            '200': DARK_BASIC_COLORS.gray['700'],
        },
        contrast: {
            '100': DARK_BASIC_COLORS.gray['200'],
            '200': DARK_BASIC_COLORS.gray['300'],
        },
        normal: {
            '100': DARK_BASIC_COLORS.gray['700'],
            '200': DARK_BASIC_COLORS.gray['900'],
        },
        inverse: BASE_BASIC_COLORS.white,
    },
    border: {
        normal: DARK_BASIC_COLORS.gray['300'],
        primary: DARK_BASIC_COLORS.blue['400'],
        secondary: DARK_BASIC_COLORS.gray['400'],
        success: DARK_BASIC_COLORS.green['400'],
        warning: DARK_BASIC_COLORS.orange['400'],
        danger: DARK_BASIC_COLORS.red['400'],
        hint: DARK_BASIC_COLORS.gray['400'],
        contrast: DARK_BASIC_COLORS.gray['400'],
    },
};
