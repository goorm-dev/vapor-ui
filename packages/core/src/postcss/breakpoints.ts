export const DEFAULT_BREAKPOINTS = {
    sm: '(max-width: 767px)',
    md: '(max-width: 1024px)',
    lg: '(min-width: 1025px)',
} as const;

export type BreakpointName = keyof typeof DEFAULT_BREAKPOINTS;

export interface BreakpointOverrides {
    sm?: string;
    md?: string;
    lg?: string;
}

export function resolveBreakpoints(overrides: BreakpointOverrides = {}): Record<BreakpointName, string> {
    for (const key of Object.keys(overrides)) {
        if (!(key in DEFAULT_BREAKPOINTS)) {
            throw new Error(
                `@vapor-ui/core/postcss: unknown breakpoint "${key}". Allowed: ${Object.keys(DEFAULT_BREAKPOINTS).join(', ')}.`,
            );
        }
    }
    return {
        sm: overrides.sm ?? DEFAULT_BREAKPOINTS.sm,
        md: overrides.md ?? DEFAULT_BREAKPOINTS.md,
        lg: overrides.lg ?? DEFAULT_BREAKPOINTS.lg,
    };
}
