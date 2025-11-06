import type { ThemeOptions } from '../../domain';
import { DEFAULT_CONTRAST_RATIOS } from './default-contrast-ratios';
import { DEFAULT_KEY_COLORS } from './default-key-colors';

/**
 * 기본 테마 옵션
 */
export const DEFAULT_THEME_OPTIONS: Required<Omit<ThemeOptions, 'brandColor'>> & {
    brandColor: undefined;
} = {
    keyColors: DEFAULT_KEY_COLORS,
    brandColor: undefined, // 기본적으로는 brandColor 없음
    backgroundColor: {
        name: 'gray',
        hexcode: '#FFFFFF',
        lightness: 100,
    },
    lightness: {
        light: 100,
        dark: 14,
    },
    contrastRatios: DEFAULT_CONTRAST_RATIOS,
} as const;
