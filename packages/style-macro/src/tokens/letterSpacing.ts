export const letterSpacing = {
    /** › `--vapor-typography-letterSpacing-000`
     *
     * › 0` */
    'letterSpacing-000': 'var(--vapor-typography-letterSpacing-000)',
    /** › `--vapor-typography-letterSpacing-100`
     *
     * › -0.1px` */
    'letterSpacing-100': 'var(--vapor-typography-letterSpacing-100)',
    /** › `--vapor-typography-letterSpacing-200`
     *
     * › -0.2px` */
    'letterSpacing-200': 'var(--vapor-typography-letterSpacing-200)',
    /** › `--vapor-typography-letterSpacing-300`
     *
     * › -0.3px` */
    'letterSpacing-300': 'var(--vapor-typography-letterSpacing-300)',
    /** › `--vapor-typography-letterSpacing-400`
     *
     * › -0.4px` */
    'letterSpacing-400': 'var(--vapor-typography-letterSpacing-400)',
} as const;

export type LetterSpacingTokens = typeof letterSpacing;
