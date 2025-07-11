import { THEME_CONFIG } from '../theme-inject/theme-injector';
import { type ThemeState } from '../theme-provider';

/* -------------------------------------------------------------------------------------------------
 * Constants & Core Types
 * -----------------------------------------------------------------------------------------------*/
const DEFAULT_THEME: ThemeState = {
    appearance: 'light',
    radius: 'md',
    scaling: 1,
};

interface VaporThemeConfig extends Partial<ThemeState> {
    /** localStorage key for persistence */
    storageKey?: string;
    /** CSP nonce value */
    nonce?: string;
    /** Enable system theme detection (for future extension) */
    enableSystemTheme?: boolean;
}
interface ResolvedThemeConfig extends ThemeState {
    storageKey: string;
    nonce?: string;
    enableSystemTheme: boolean;
}

/**
 * Creates a complete configuration object by merging user config with defaults
 *
 * @example
 * ```tsx
 * const config = createThemeConfig({
 *   appearance: 'dark',
 *   storageKey: 'my-app-theme'
 * });
 * ```
 */
const createThemeConfig = (userConfig?: VaporThemeConfig): ResolvedThemeConfig => {
    const {
        storageKey = THEME_CONFIG.STORAGE_KEY,
        nonce,
        enableSystemTheme = false,
        ...themeProps
    } = userConfig ?? {};

    return {
        ...DEFAULT_THEME,
        ...themeProps,
        storageKey,
        nonce,
        enableSystemTheme,
    };
};

export { createThemeConfig };
