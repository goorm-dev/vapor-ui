'use client';

import type { ReactNode } from 'react';
import { createContext, memo, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { RADIUS_FACTOR_VAR_NAME, SCALE_FACTOR_VAR_NAME } from '../../styles/global.css';
import { THEME_CONFIG, themeInjectScript } from './theme-injector';
import type { ColorTheme, RadiusTheme, ScaleFactor, ThemeState } from './theme-injector';

const DEFAULT_THEME = {
    colorTheme: 'light' as ColorTheme,
    radiusTheme: 'md' as RadiusTheme,
    scaleFactor: 1 as ScaleFactor,
};

/**
 * Unified configuration interface for ThemeProvider and ThemeScript
 */
interface VaporThemeConfig {
    /** Default theme state */
    defaultTheme?: Partial<ThemeState>;
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
interface ResolvedThemeConfig {
    defaultTheme: ThemeState;
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
 *   defaultTheme: { colorTheme: 'dark' },
 *   storageKey: 'my-app-theme'
 * });
 * ```
 */
function createThemeConfig(userConfig?: VaporThemeConfig): ResolvedThemeConfig {
    return {
        defaultTheme: { ...DEFAULT_THEME, ...userConfig?.defaultTheme },
        storageKey: userConfig?.storageKey ?? THEME_CONFIG.STORAGE_KEY,
        nonce: userConfig?.nonce,
        enableSystemTheme: userConfig?.enableSystemTheme ?? false,
    };
}

/**
 * Validates theme configuration
 * @internal
 */
function validateThemeConfig(config: unknown): config is VaporThemeConfig {
    if (!config || typeof config !== 'object') return true;

    const c = config as Partial<VaporThemeConfig>;

    if (c.storageKey !== undefined && typeof c.storageKey !== 'string') {
        console.warn('[@vapor-ui/core] Invalid storageKey type. Expected string.');
        return false;
    }

    if (c.defaultTheme !== undefined && typeof c.defaultTheme !== 'object') {
        console.warn('[@vapor-ui/core] Invalid defaultTheme type. Expected object.');
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
        if (typeof window === 'undefined') {
            return resolvedConfig.defaultTheme;
        }
        try {
            const storedItem = localStorage.getItem(resolvedConfig.storageKey);
            const storedSettings = storedItem ? JSON.parse(storedItem) : {};
            return { ...resolvedConfig.defaultTheme, ...storedSettings };
        } catch (e) {
            console.error('[@vapor-ui/core] Failed to read theme from localStorage.', e);
            return resolvedConfig.defaultTheme;
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
        const { colorTheme, radiusTheme, scaleFactor } = themeState;

        // 1. Color theme
        if (colorTheme === 'dark') {
            root.classList.add(THEME_CONFIG.CLASS_NAMES.dark);
            root.classList.remove(THEME_CONFIG.CLASS_NAMES.light);
        } else {
            root.classList.add(THEME_CONFIG.CLASS_NAMES.light);
            root.classList.remove(THEME_CONFIG.CLASS_NAMES.dark);
        }

        // 2. Radius theme
        const radiusFactor = THEME_CONFIG.RADIUS_FACTOR_MAP[radiusTheme] ?? 1;
        root.style.setProperty(`--${RADIUS_FACTOR_VAR_NAME}`, radiusFactor.toString());

        // 3. Scale theme
        const currentScaleFactor = scaleFactor ?? 1;
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

    const scriptContent = `(${themeInjectScript.toString()})(
        ${JSON.stringify(resolvedConfig.defaultTheme)},
        '${resolvedConfig.storageKey}',
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

export {
    ThemeProvider,
    ThemeScript,
    //
    useTheme,
    createThemeConfig,
};

export type {
    VaporThemeConfig,
    ThemeContextValue,
    ResolvedThemeConfig,
    ThemeProviderProps,
    ThemeScriptProps,
};
