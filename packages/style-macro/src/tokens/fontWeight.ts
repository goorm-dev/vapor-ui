export const fontWeight = {
    /** `var(--vapor-typography-fontWeight-400)` → `400` */
    'fontWeight-400': 'var(--vapor-typography-fontWeight-400)',
    /** `var(--vapor-typography-fontWeight-500)` → `500` */
    'fontWeight-500': 'var(--vapor-typography-fontWeight-500)',
    /** `var(--vapor-typography-fontWeight-700)` → `700` */
    'fontWeight-700': 'var(--vapor-typography-fontWeight-700)',
    /** `var(--vapor-typography-fontWeight-800)` → `800` */
    'fontWeight-800': 'var(--vapor-typography-fontWeight-800)',
} as const;

export type FontWeightTokens = typeof fontWeight;
