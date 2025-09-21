'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const DARK_CLASS_NAME = 'vapor-dark-theme'

/* -------------------------------------------------------------------------------------------------
 * NOTE: Theme Priority Order (highest to lowest):
 *
 * 1. forcedTheme - Force a specific theme (when developer wants to override all settings)
 * 2. localStorage - User's saved theme via setTheme() (respects user choice)
 * 3. defaultTheme - Initial theme for first load
 * 4. system theme - Only referenced when defaultTheme is 'system'
 * -----------------------------------------------------------------------------------------------*/

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
interface ThemeConfig {
    /**
     * Theme to display on initial load (Priority: 3rd)
     * Only used when no theme is saved in localStorage
     * @default 'system'
     */
    defaultTheme?: 'light' | 'dark' | 'system';

    /**
     * Key used to store theme in localStorage
     * Theme is saved to localStorage only when setTheme() is called (Priority: 2nd)
     * @default 'vapor-ui-theme'
     */
    storageKey?: string;

    /**
     * Whether to automatically sync with user's system theme changes
     * When false, system theme is only referenced on initial load, then operates independently
     * @default true
     */
    enableSystem?: boolean;

    /**
     * Force a specific theme (Priority: 1st - highest)
     * When set, ignores all other theme settings and always applies this value
     */
    forcedTheme?: string;

    /**
     * Whether to disable CSS transitions during theme changes
     * @default false
     */
    disableTransitionOnChange?: boolean;

    /**
     * Whether to automatically set CSS color-scheme property
     * @default true
     */
    enableColorScheme?: boolean;

    /**
     * CSP nonce value (Content Security Policy)
     */
    nonce?: string;
}

interface UseThemeProps {
    /** Current active theme ('light' | 'dark' | 'system') */
    theme?: string;

    /** Function to change theme (automatically saves to localStorage) */
    setTheme: (theme: string | ((prev: string) => string)) => void;

    /** Resets theme to default and clears localStorage */
    resetTheme: () => void;

    /** Forced theme if set (highest priority) */
    forcedTheme?: string;

    /** Actually applied theme ('light' | 'dark') */
    resolvedTheme?: string;

    /** List of available themes */
    themes: string[];

    /** Current system theme (only provided when enableSystem=true) */
    systemTheme?: 'light' | 'dark';
}

interface ThemeProviderProps extends ThemeConfig {
    children: React.ReactNode;
}

/* -------------------------------------------------------------------------------------------------
 * Constants
 * -----------------------------------------------------------------------------------------------*/
const MEDIA_QUERY = '(prefers-color-scheme: dark)';
const COLOR_SCHEMES = ['light', 'dark'];
const THEME_LIST = ['light', 'dark'];

/* -------------------------------------------------------------------------------------------------
 * Utilities
 * -----------------------------------------------------------------------------------------------*/
const getTheme = (storageKey: string, defaultTheme?: string): string | undefined => {
    try {
        return localStorage.getItem(storageKey) || defaultTheme;
    } catch {
        return defaultTheme;
    }
};

const getSystemTheme = (e?: MediaQueryList | MediaQueryListEvent): 'light' | 'dark' => {
    if (!e) e = window.matchMedia(MEDIA_QUERY);
    return e.matches ? 'dark' : 'light';
};

const saveToStorage = (storageKey: string, value: string): void => {
    try {
        localStorage.setItem(storageKey, value);
    } catch {
        // Storage not available
    }
};

const disableAnimation = (nonce?: string) => {
    const css = document.createElement('style');
    if (nonce) css.setAttribute('nonce', nonce);
    css.appendChild(
        document.createTextNode(
            '*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}',
        ),
    );
    document.head.appendChild(css);

    return () => {
        (() => window.getComputedStyle(document.body))();
        setTimeout(() => {
            document.head.removeChild(css);
        }, 1);
    };
};

/* -------------------------------------------------------------------------------------------------
 * Components
 * -----------------------------------------------------------------------------------------------*/
const ThemeContext = createContext<UseThemeProps | undefined>(undefined);

const ThemeProvider = (props: ThemeProviderProps) => {
    const context = useContext(ThemeContext);
    if (context) return <>{props.children}</>;
    return <Theme {...props} />;
};

const Theme = ({
    children,
    defaultTheme = 'system',
    storageKey = 'vapor-ui-theme',
    enableSystem = true,
    forcedTheme,
    disableTransitionOnChange = false,
    enableColorScheme = true,
    nonce,
}: ThemeProviderProps) => {
    const [theme, setThemeState] = useState(
        () => getTheme(storageKey, defaultTheme) || defaultTheme,
    );
    const [resolvedTheme, setResolvedTheme] = useState(() => {
        const initialTheme = getTheme(storageKey, defaultTheme) || defaultTheme;
        return initialTheme === 'system' ? getSystemTheme() : initialTheme;
    });

    const applyTheme = useCallback(
        (newTheme: string) => {
            let resolved = newTheme;
            if (newTheme === 'system' && enableSystem) {
                resolved = getSystemTheme();
            }

            const enableTransition = disableTransitionOnChange ? disableAnimation(nonce) : null;
            const d = document.documentElement;

            d.classList.remove(DARK_CLASS_NAME);

            if (resolved === 'dark') {
                d.classList.add(DARK_CLASS_NAME);
            }

            if (enableColorScheme) {
                const fallback = COLOR_SCHEMES.includes(defaultTheme) ? defaultTheme : null;
                const colorScheme = COLOR_SCHEMES.includes(resolved) ? resolved : fallback;
                d.style.colorScheme = colorScheme || '';
            }

            enableTransition?.();
        },
        [enableSystem, enableColorScheme, defaultTheme, disableTransitionOnChange, nonce],
    );

    const setTheme = useCallback(
        (newTheme: string | ((prev: string) => string)) => {
            const resolvedTheme = typeof newTheme === 'function' ? newTheme(theme) : newTheme;
            setThemeState(resolvedTheme);
            saveToStorage(storageKey, resolvedTheme);
        },
        [storageKey, theme],
    );

    const resetTheme = useCallback(() => {
        try {
            localStorage.removeItem(storageKey);
        } catch {
            // Storage not available
        }
        setThemeState(defaultTheme);
    }, [storageKey, defaultTheme]);

    const handleMediaQuery = useCallback(
        (e: MediaQueryListEvent | MediaQueryList) => {
            const systemTheme = getSystemTheme(e);
            setResolvedTheme(systemTheme);

            if (enableSystem && !forcedTheme) {
                applyTheme(systemTheme);
            }
        },
        [enableSystem, forcedTheme, applyTheme],
    );

    useEffect(() => {
        const media = window.matchMedia(MEDIA_QUERY);
        media.addEventListener('change', handleMediaQuery);
        handleMediaQuery(media);

        return () => media.removeEventListener('change', handleMediaQuery);
    }, [handleMediaQuery]);

    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === storageKey) {
                const newTheme = e.newValue || defaultTheme;
                setThemeState(newTheme);
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [defaultTheme, storageKey]);

    useEffect(() => {
        applyTheme(forcedTheme || theme);
    }, [forcedTheme, theme, applyTheme]);

    const contextValue = useMemo(
        () => ({
            theme,
            setTheme,
            resetTheme,
            forcedTheme,
            resolvedTheme: theme === 'system' ? resolvedTheme : theme,
            themes: enableSystem ? [...THEME_LIST, 'system'] : THEME_LIST,
            systemTheme: enableSystem ? (resolvedTheme as 'light' | 'dark') : undefined,
        }),
        [theme, setTheme, resetTheme, forcedTheme, resolvedTheme, enableSystem],
    );

    return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

/* -------------------------------------------------------------------------------------------------
 * useTheme Hook
 * -----------------------------------------------------------------------------------------------*/
const useTheme = (): UseThemeProps => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

/* -----------------------------------------------------------------------------------------------*/
export { ThemeProvider, useTheme };
export type { ThemeConfig, UseThemeProps, ThemeProviderProps };
export type UseThemeReturn = UseThemeProps;
