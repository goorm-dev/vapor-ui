import type { ContrastRatios } from '../../domain';

/**
 * 기본 명암비 설정 (WCAG 기준)
 */
export const DEFAULT_CONTRAST_RATIOS: ContrastRatios = {
    '050': 1.07,
    '100': 1.3,
    '200': 1.7,
    '300': 2.5,
    '400': 3.0,
    '500': 4.5, // WCAG AA (Normal Text)
    '600': 6.5,
    '700': 8.5, // WCAG AAA (Normal Text)
    '800': 11.5,
    '900': 15.0,
} as const;
