/* -------------------------------------------------------------------------------------------------
 * Theme Configuration (Simplified)
 * -----------------------------------------------------------------------------------------------*/

// 런타임 전용 설정 관리 (appearance만)
interface ThemeConfig {
    appearance?: 'light' | 'dark' | 'system';
    storageKey?: string;
    enableSystemTheme?: boolean;
    nonce?: string;
}

interface ResolvedThemeConfig {
    appearance: 'light' | 'dark' | 'system';
    storageKey: string;
    enableSystemTheme: boolean;
    nonce?: string;
}

const DEFAULT_CONFIG = {
    appearance: 'system' as const,
    storageKey: 'vapor-ui-theme',
    enableSystemTheme: true,
};

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
const createThemeConfig = (userConfig?: ThemeConfig): ResolvedThemeConfig => {
    return {
        ...DEFAULT_CONFIG,
        ...userConfig,
    };
};

export { createThemeConfig };
export type { ThemeConfig, ResolvedThemeConfig };