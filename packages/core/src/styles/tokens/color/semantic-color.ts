import { BASE_BASIC_COLORS, DARK_BASIC_COLORS, LIGHT_BASIC_COLORS } from './basic-color';

export const LIGHT_SEMANTIC_COLORS = {
    background: {
        primary: {
            '100': LIGHT_BASIC_COLORS.blue['050'],
            '200': LIGHT_BASIC_COLORS.blue['500'],
        },
        secondary: {
            '100': LIGHT_BASIC_COLORS.gray['050'],
            '200': LIGHT_BASIC_COLORS.gray['200'],
        },
        success: {
            '100': LIGHT_BASIC_COLORS.green['050'],
            '200': LIGHT_BASIC_COLORS.green['500'],
        },
        warning: {
            '100': LIGHT_BASIC_COLORS.orange['050'],
            '200': LIGHT_BASIC_COLORS.orange['500'],
        },
        danger: {
            '100': LIGHT_BASIC_COLORS.red['050'],
            '200': LIGHT_BASIC_COLORS.red['500'],
        },
        hint: {
            '100': LIGHT_BASIC_COLORS.gray['050'],
            '200': LIGHT_BASIC_COLORS.gray['600'],
        },
        contrast: {
            '100': LIGHT_BASIC_COLORS.gray['300'],
            '200': LIGHT_BASIC_COLORS.gray['800'],
        },
        surface: {
            '100': BASE_BASIC_COLORS.white,
            '200': LIGHT_BASIC_COLORS.gray['050'],
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
            '100': LIGHT_BASIC_COLORS.gray['900'],
            '200': LIGHT_BASIC_COLORS.gray['700'],
        },
        accent: BASE_BASIC_COLORS.white,
    },
    border: {
        normal: LIGHT_BASIC_COLORS.gray['300'],
        primary: LIGHT_BASIC_COLORS.blue['500'],
        secondary: LIGHT_BASIC_COLORS.gray['200'],
        success: LIGHT_BASIC_COLORS.green['500'],
        warning: LIGHT_BASIC_COLORS.orange['500'],
        danger: LIGHT_BASIC_COLORS.red['500'],
        hint: LIGHT_BASIC_COLORS.gray['600'],
        contrast: LIGHT_BASIC_COLORS.gray['800'],
    },
    logo: {
        normal: LIGHT_BASIC_COLORS.gray['900'],
    },
    button: {
        foreground: {
            primary: BASE_BASIC_COLORS.white,
        },
    },
};

export const DARK_SEMANTIC_COLORS = {
    background: {
        primary: {
            '100': DARK_BASIC_COLORS.blue['900'],
            '200': DARK_BASIC_COLORS.blue['500'],
        },
        secondary: {
            '100': DARK_BASIC_COLORS.gray['950'],
            '200': DARK_BASIC_COLORS.gray['200'],
        },
        success: {
            '100': DARK_BASIC_COLORS.green['900'],
            '200': DARK_BASIC_COLORS.green['500'],
        },
        warning: {
            '100': DARK_BASIC_COLORS.orange['900'],
            '200': DARK_BASIC_COLORS.orange['500'],
        },
        danger: {
            '100': DARK_BASIC_COLORS.red['900'],
            '200': DARK_BASIC_COLORS.red['500'],
        },
        hint: {
            '100': DARK_BASIC_COLORS.gray['900'],
            '200': DARK_BASIC_COLORS.gray['600'],
        },
        contrast: {
            '100': DARK_BASIC_COLORS.gray['700'],
            '200': DARK_BASIC_COLORS.gray['300'],
        },
        surface: {
            '100': DARK_BASIC_COLORS.gray['100'],
            '200': DARK_BASIC_COLORS.gray['050'],
        },
    },
    foreground: {
        primary: {
            '100': DARK_BASIC_COLORS.blue['500'],
            '200': DARK_BASIC_COLORS.blue['600'],
        },
        secondary: {
            '100': DARK_BASIC_COLORS.gray['500'],
            '200': DARK_BASIC_COLORS.gray['600'],
        },
        success: {
            '100': DARK_BASIC_COLORS.green['500'],
            '200': DARK_BASIC_COLORS.green['600'],
        },
        warning: {
            '100': DARK_BASIC_COLORS.orange['500'],
            '200': DARK_BASIC_COLORS.orange['600'],
        },
        danger: {
            '100': DARK_BASIC_COLORS.red['500'],
            '200': DARK_BASIC_COLORS.red['600'],
        },
        hint: {
            '100': DARK_BASIC_COLORS.gray['600'],
            '200': DARK_BASIC_COLORS.gray['700'],
        },
        contrast: {
            '100': DARK_BASIC_COLORS.gray['300'],
            '200': DARK_BASIC_COLORS.gray['400'],
        },
        normal: {
            '100': DARK_BASIC_COLORS.gray['900'],
            '200': DARK_BASIC_COLORS.gray['700'],
        },
        accent: BASE_BASIC_COLORS.white,
    },
    border: {
        normal: DARK_BASIC_COLORS.gray['200'],
        primary: DARK_BASIC_COLORS.blue['500'],
        secondary: DARK_BASIC_COLORS.gray['200'],
        success: DARK_BASIC_COLORS.green['500'],
        warning: DARK_BASIC_COLORS.orange['500'],
        danger: DARK_BASIC_COLORS.red['500'],
        hint: DARK_BASIC_COLORS.gray['600'],
        contrast: DARK_BASIC_COLORS.gray['300'],
    },
    logo: {
        normal: BASE_BASIC_COLORS.white,
    },
    button: {
        foreground: {
            primary: BASE_BASIC_COLORS.white,
        },
    },
};
