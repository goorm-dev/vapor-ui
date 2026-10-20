export const fontFamily = {
    /** `var(--vapor-typography-fontFamily-sans)` → `"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif` */
    'fontFamily-sans': 'var(--vapor-typography-fontFamily-sans)',
    /** `var(--vapor-typography-fontFamily-code)` → `"Fira Code", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace` */
    'fontFamily-code': 'var(--vapor-typography-fontFamily-code)',
} as const;

export type FontFamilyTokens = typeof fontFamily;
