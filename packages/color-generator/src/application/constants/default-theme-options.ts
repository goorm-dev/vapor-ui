import type { DeepRequired, ThemeOptions } from '../../domain';
import { DEFAULT_CONTRAST_RATIOS } from './default-contrast-ratios';
import { DEFAULT_KEY_COLORS } from './default-key-colors';

/**
 * 기본 테마 옵션
 */
export const DEFAULT_THEME_OPTIONS: DeepRequired<Omit<ThemeOptions, 'brandColor'>> & {
    brandColor: undefined;
} = {
    keyColors: DEFAULT_KEY_COLORS,
    brandColor: undefined,
    backgroundColor: {
        name: 'gray',
        hexcode: '#FFFFFF',
        lightness: {
            light: 100,
            dark: 14,
        },
    },
    contrastRatios: DEFAULT_CONTRAST_RATIOS,
} as const;
