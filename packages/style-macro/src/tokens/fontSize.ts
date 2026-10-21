export const fontSize = {
    /** `var(--vapor-typography-fontSize-025)` → `10px` */
    'fontSize-025': 'var(--vapor-typography-fontSize-025)',
    /** `var(--vapor-typography-fontSize-050)` → `12px` */
    'fontSize-050': 'var(--vapor-typography-fontSize-050)',
    /** `var(--vapor-typography-fontSize-075)` → `14px` */
    'fontSize-075': 'var(--vapor-typography-fontSize-075)',
    /** `var(--vapor-typography-fontSize-100)` → `16px` */
    'fontSize-100': 'var(--vapor-typography-fontSize-100)',
    /** `var(--vapor-typography-fontSize-200)` → `18px` */
    'fontSize-200': 'var(--vapor-typography-fontSize-200)',
    /** `var(--vapor-typography-fontSize-300)` → `20px` */
    'fontSize-300': 'var(--vapor-typography-fontSize-300)',
    /** `var(--vapor-typography-fontSize-400)` → `24px` */
    'fontSize-400': 'var(--vapor-typography-fontSize-400)',
    /** `var(--vapor-typography-fontSize-500)` → `32px` */
    'fontSize-500': 'var(--vapor-typography-fontSize-500)',
    /** `var(--vapor-typography-fontSize-600)` → `38px` */
    'fontSize-600': 'var(--vapor-typography-fontSize-600)',
    /** `var(--vapor-typography-fontSize-700)` → `48px` */
    'fontSize-700': 'var(--vapor-typography-fontSize-700)',
    /** `var(--vapor-typography-fontSize-800)` → `64px` */
    'fontSize-800': 'var(--vapor-typography-fontSize-800)',
    /** `var(--vapor-typography-fontSize-900)` → `80px` */
    'fontSize-900': 'var(--vapor-typography-fontSize-900)',
    /** `var(--vapor-typography-fontSize-1000)` → `120px` */
    'fontSize-1000': 'var(--vapor-typography-fontSize-1000)',
} as const;

export type FontSizeTokens = typeof fontSize;
