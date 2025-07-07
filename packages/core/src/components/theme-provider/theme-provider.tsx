'use client';

import type { ReactNode } from 'react';
import { createContext, memo, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { RADIUS_FACTOR_VAR_NAME, SCALE_FACTOR_VAR_NAME } from '~/styles/global-var.css';

import { THEME_CONFIG, themeInjectScript } from './theme-injector';
import type { Appearance, Radius, Scaling, ThemeState } from './theme-injector';

/* -------------------------------------------------------------------------------------------------
 * Constants & Core Types
 * -----------------------------------------------------------------------------------------------*/
const DEFAULT_THEME: ThemeState = {
    appearance: 'light',
    radius: 'md',
    scaling: 1,
};

/**
 * Unified configuration interface for ThemeProvider and ThemeScript
 */
interface VaporThemeConfig extends Partial<ThemeState> {
    /** localStorage key for persistence */
    storageKey?: string;
    /** CSP nonce value */
    nonce?: string;
    /** Enable system theme detection (for future extension) */
    enableSystemTheme?: boolean;
}

/**
 * Internal resolved configuration type
 */
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
function createThemeConfig(userConfig?: VaporThemeConfig): ResolvedThemeConfig {
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
}

/**
 * Validates theme configuration
 * @internal
 */
function validateThemeConfig(config: unknown): config is VaporThemeConfig {
    if (!config || typeof config !== 'object') return true;

    const c = config as Partial<VaporThemeConfig>;

    if (c.appearance !== undefined && !['light', 'dark'].includes(c.appearance as Appearance)) {
        console.warn('[@vapor-ui/core] Invalid appearance type. Expected "light" or "dark".');
        return false;
    }
    if (
        c.radius !== undefined &&
        !Object.keys(THEME_CONFIG.RADIUS_FACTOR_MAP).includes(c.radius as Radius)
    ) {
        console.warn('[@vapor-ui/core] Invalid radius type. Expected a valid radius key.');
        return false;
    }
    if (c.scaling !== undefined && typeof c.scaling !== 'number') {
        console.warn('[@vapor-ui/core] Invalid scaling type. Expected a number.');
        return false;
    }
    if (c.storageKey !== undefined && typeof c.storageKey !== 'string') {
        console.warn('[@vapor-ui/core] Invalid storageKey type. Expected string.');
        return false;
    }

    return true;
}

/* -------------------------------------------------------------------------------------------------
 * ThemeProvider
 * -----------------------------------------------------------------------------------------------*/

interface ThemeContextValue extends ThemeState {
    setTheme: (newTheme: Partial<ThemeState>) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
    config?: VaporThemeConfig;
}

const ThemeProvider = ({ children, config }: ThemeProviderProps) => {
    // Merge configuration
    const resolvedConfig = useMemo<ResolvedThemeConfig>(() => {
        if (config) {
            validateThemeConfig(config);
        }
        return createThemeConfig(config);
    }, [config]);

    // Initialize theme state
    const [themeState, internalSetThemeState] = useState<ThemeState>(() => {
        const { storageKey, nonce, enableSystemTheme, ...defaultTheme } = resolvedConfig;
        if (typeof window === 'undefined') {
            return defaultTheme;
        }
        try {
            const storedItem = localStorage.getItem(resolvedConfig.storageKey);
            const storedSettings = storedItem ? JSON.parse(storedItem) : {};
            return { ...defaultTheme, ...storedSettings };
        } catch (e) {
            console.error('[@vapor-ui/core] Failed to read theme from localStorage.', e);
            return defaultTheme;
        }
    });

    const setTheme = useCallback(
        (newThemePartial: Partial<ThemeState>) => {
            internalSetThemeState((prevState) => {
                const updatedState = { ...prevState, ...newThemePartial };

                try {
                    localStorage.setItem(resolvedConfig.storageKey, JSON.stringify(updatedState));
                } catch (e) {
                    console.error(
                        '[@vapor-ui/core] Could not save theme state to localStorage.',
                        e,
                    );
                }
                return updatedState;
            });
        },
        [resolvedConfig.storageKey],
    );

    // Storage event listener
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === resolvedConfig.storageKey && event.newValue) {
                try {
                    internalSetThemeState(JSON.parse(event.newValue));
                } catch (e) {
                    console.error(
                        '[@vapor-ui/core] Error parsing stored theme from storage event.',
                        e,
                    );
                }
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [resolvedConfig.storageKey]);

    // DOM updates
    useEffect(() => {
        const root = document.documentElement;
        const { appearance, radius, scaling } = themeState;

        // 1. Color theme
        if (appearance === 'dark') {
            root.classList.add(THEME_CONFIG.CLASS_NAMES.dark);
            root.classList.remove(THEME_CONFIG.CLASS_NAMES.light);
        } else {
            root.classList.add(THEME_CONFIG.CLASS_NAMES.light);
            root.classList.remove(THEME_CONFIG.CLASS_NAMES.dark);
        }

        // 2. Radius theme
        const radiusFactor = THEME_CONFIG.RADIUS_FACTOR_MAP[radius] ?? 1;
        root.style.setProperty(`--${RADIUS_FACTOR_VAR_NAME}`, radiusFactor.toString());

        // 3. Scale theme
        const currentScaleFactor = scaling ?? 1;
        root.style.setProperty(`--${SCALE_FACTOR_VAR_NAME}`, currentScaleFactor.toString());
    }, [themeState]);

    const contextValue = useMemo(() => ({ ...themeState, setTheme }), [themeState, setTheme]);

    return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

/* -------------------------------------------------------------------------------------------------
 * ThemeScript
 * -----------------------------------------------------------------------------------------------*/

interface ThemeScriptProps {
    config?: VaporThemeConfig;
}

const ThemeScript = memo(({ config }: ThemeScriptProps) => {
    const resolvedConfig = useMemo<ResolvedThemeConfig>(() => {
        return createThemeConfig(config);
    }, [config]);

    const cssVarNames = {
        radiusFactor: RADIUS_FACTOR_VAR_NAME,
        scaleFactor: SCALE_FACTOR_VAR_NAME,
    };

    const { storageKey, nonce, enableSystemTheme, ...defaultTheme } = resolvedConfig;

    const scriptContent = `(${themeInjectScript.toString()})(
        ${JSON.stringify(defaultTheme)},
        '${storageKey}',
        ${JSON.stringify(THEME_CONFIG)},
        ${JSON.stringify(cssVarNames)}
    )`;

    return (
        <script
            nonce={resolvedConfig.nonce}
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: scriptContent }}
        />
    );
});

ThemeScript.displayName = 'ThemeScript';

/* -----------------------------------------------------------------------------------------------*/

const useTheme = (): ThemeContextValue => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('`useTheme` must be used within a `ThemeProvider`.');
    }
    return context;
};

/* -----------------------------------------------------------------------------------------------*/

export { ThemeProvider, ThemeScript, useTheme, createThemeConfig };
export type { VaporThemeConfig, ThemeState, Appearance, Radius, Scaling };
