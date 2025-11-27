import type { PaletteChip } from '../../domain';

/**
 * 디자인 시스템의 기본 11개 키 컬러 (gray 포함)
 */
export const DEFAULT_KEY_COLORS = {
    red: '#F5535E',
    pink: '#F26394',
    grape: '#CC5DE8',
    violet: '#8662F3',
    blue: '#2A72E5',
    cyan: '#1EBAD2',
    green: '#058765',
    lime: '#8FD327',
    yellow: '#FFC107',
    orange: '#ED670C',
    gray: '#ffffff',
} as const;

/**
 * 기본 색상 토큰 (white, black)
 */
export const BASE_TOKENS: Record<string, PaletteChip> = {
    'color-white': {
        name: 'color-white',
        hex: '#FFFFFF',
        oklch: 'oklch(1 0 0)',
        deltaE: 0,
        codeSyntax: 'vapor-color-white',
    },
    'color-black': {
        name: 'color-black',
        hex: '#000000',
        oklch: 'oklch(0 0 0)',
        deltaE: 0,
        codeSyntax: 'vapor-color-black',
    },
} as const;
