import type { ColorToken } from '../types';

const BASE_COLORS = {
    white: {
        name: 'color-white',
        hex: '#FFFFFF',
        oklch: 'oklch(1 0 0)',
        codeSyntax: 'vapor-color-white',
    } as ColorToken,
    black: {
        name: 'color-black',
        hex: '#000000',
        oklch: 'oklch(0 0 0)',
        codeSyntax: 'vapor-color-black',
    } as ColorToken,
} as const satisfies Record<'white' | 'black', ColorToken>;

const DEFAULT_PRIMITIVE_COLORS = {
    red: '#F5535E',
    pink: '#F26394',
    grape: '#CC5DE8',
    violet: '#8662F3',
    blue: '#448EFE',
    cyan: '#1EBAD2',
    green: '#04A37E',
    lime: '#1EBAD2',
    yellow: '#FFC107',
    orange: '#ED670C',
} as const;

/* -----------------------------------------------------------------------------------------------*/

export {
    BASE_COLORS,
    DEFAULT_PRIMITIVE_COLORS,
};

export const Colors = {
    BASE_COLORS,
    DEFAULT_PRIMITIVE_COLORS,
};