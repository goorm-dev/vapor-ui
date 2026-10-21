export const dimension = {
    /** `var(--vapor-size-dimension-025)` → `2px` */
    'dimension-025': 'var(--vapor-size-dimension-025)',
    /** `var(--vapor-size-dimension-050)` → `4px` */
    'dimension-050': 'var(--vapor-size-dimension-050)',
    /** `var(--vapor-size-dimension-075)` → `6px` */
    'dimension-075': 'var(--vapor-size-dimension-075)',
    /** `var(--vapor-size-dimension-100)` → `8px` */
    'dimension-100': 'var(--vapor-size-dimension-100)',
    /** `var(--vapor-size-dimension-150)` → `12px` */
    'dimension-150': 'var(--vapor-size-dimension-150)',
    /** `var(--vapor-size-dimension-175)` → `14px` */
    'dimension-175': 'var(--vapor-size-dimension-175)',
    /** `var(--vapor-size-dimension-200)` → `16px` */
    'dimension-200': 'var(--vapor-size-dimension-200)',
    /** `var(--vapor-size-dimension-225)` → `18px` */
    'dimension-225': 'var(--vapor-size-dimension-225)',
    /** `var(--vapor-size-dimension-250)` → `20px` */
    'dimension-250': 'var(--vapor-size-dimension-250)',
    /** `var(--vapor-size-dimension-300)` → `24px` */
    'dimension-300': 'var(--vapor-size-dimension-300)',
    /** `var(--vapor-size-dimension-400)` → `32px` */
    'dimension-400': 'var(--vapor-size-dimension-400)',
    /** `var(--vapor-size-dimension-500)` → `40px` */
    'dimension-500': 'var(--vapor-size-dimension-500)',
    /** `var(--vapor-size-dimension-600)` → `48px` */
    'dimension-600': 'var(--vapor-size-dimension-600)',
    /** `var(--vapor-size-dimension-700)` → `56px` */
    'dimension-700': 'var(--vapor-size-dimension-700)',
    /** `var(--vapor-size-dimension-800)` → `64px` */
    'dimension-800': 'var(--vapor-size-dimension-800)',
} as const;

export type DimensionTokens = typeof dimension;
