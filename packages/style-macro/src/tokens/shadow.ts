export const shadow = {
    /** `var(--vapor-shadow-sm)` → `0 0.0625rem 0.1875rem color-mix(in srgb, #000000 20%, transparent)` */
    'shadow-sm': 'var(--vapor-shadow-sm)',
    /** `var(--vapor-shadow-md)` → `0 0.25rem 0.625rem color-mix(in srgb, #000000 20%, transparent)` */
    'shadow-md': 'var(--vapor-shadow-md)',
    /** `var(--vapor-shadow-lg)` → `0 0.25rem 1rem color-mix(in srgb, #000000 20%, transparent)` */
    'shadow-lg': 'var(--vapor-shadow-lg)',
    /** `var(--vapor-shadow-xl)` → `0 1rem 2rem color-mix(in srgb, #000000 20%, transparent)` */
    'shadow-xl': 'var(--vapor-shadow-xl)',
} as const;

export type ShadowTokens = typeof shadow;
