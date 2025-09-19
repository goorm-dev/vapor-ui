'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/

interface ThemeConfig {
    defaultTheme?: 'light' | 'dark' | 'system';
    storageKey?: string;
    enableSystem?: boolean;
    forcedTheme?: string;
    disableTransitionOnChange?: boolean;
    enableColorScheme?: boolean;
    nonce?: string;
}

interface UseThemeProps {
    theme?: string;
    setTheme: (theme: string | ((prev: string) => string)) => void;
    forcedTheme?: string;
    resolvedTheme?: string;
    themes: string[];
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
const DEFAULT_THEMES = ['light', 'dark'];

/* -------------------------------------------------------------------------------------------------
 * Utilities
 * -----------------------------------------------------------------------------------------------*/

const isServer = typeof window === 'undefined';

const getTheme = (storageKey: string, defaultTheme?: string): string | undefined => {
    if (isServer) return undefined;
    try {
        return localStorage.getItem(storageKey) || defaultTheme;
    } catch {
        return defaultTheme;
    }
};

const getSystemTheme = (e?: MediaQueryList | MediaQueryListEvent): 'light' | 'dark' => {
    if (isServer) return 'light';
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
 * Context
 * -----------------------------------------------------------------------------------------------*/

const ThemeContext = createContext<UseThemeProps | undefined>(undefined);

const defaultContext: UseThemeProps = {
    setTheme: () => {},
    themes: [],
};

/* -------------------------------------------------------------------------------------------------
 * ThemeProvider
 * -----------------------------------------------------------------------------------------------*/

const ThemeProvider = ({
    children,
    defaultTheme = 'system',
    storageKey = 'vapor-ui-theme',
    enableSystem = true,
    forcedTheme,
    disableTransitionOnChange = false,
    enableColorScheme = true,
    nonce,
}: ThemeProviderProps) => {
    const context = useContext(ThemeContext);

    if (context) return <>{children}</>;

    return (
        <Theme
            defaultTheme={defaultTheme}
            storageKey={storageKey}
            enableSystem={enableSystem}
            forcedTheme={forcedTheme}
            disableTransitionOnChange={disableTransitionOnChange}
            enableColorScheme={enableColorScheme}
            nonce={nonce}
        >
            {children}
        </Theme>
    );
};

/* -------------------------------------------------------------------------------------------------
 * Theme (Internal)
 * -----------------------------------------------------------------------------------------------*/

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
    const [theme, setThemeState] = useState(() => {
        if (isServer) return defaultTheme;
        return getTheme(storageKey, defaultTheme) || defaultTheme;
    });

    const [resolvedTheme, setResolvedTheme] = useState(() => {
        if (isServer) return defaultTheme === 'system' ? 'light' : defaultTheme;
        return theme === 'system' ? getSystemTheme() : theme;
    });

    const applyTheme = useCallback(
        (newTheme: string) => {
            if (!newTheme || isServer) return;

            let resolved = newTheme;
            if (newTheme === 'system' && enableSystem) {
                resolved = getSystemTheme();
            }

            const enableTransition = disableTransitionOnChange ? disableAnimation(nonce) : null;
            const d = document.documentElement;

            d.classList.remove('vapor-light-theme', 'vapor-dark-theme', 'light', 'dark');

            if (resolved === 'light') d.classList.add('vapor-light-theme');
            if (resolved === 'dark') d.classList.add('vapor-dark-theme');

            if (enableColorScheme) {
                const fallback = COLOR_SCHEMES.includes(defaultTheme) ? defaultTheme : null;
                const colorScheme = COLOR_SCHEMES.includes(resolved) ? resolved : fallback;
                // @ts-ignore
                d.style.colorScheme = colorScheme;
            }

            enableTransition?.();
        },
        [enableSystem, enableColorScheme, defaultTheme, disableTransitionOnChange, nonce],
    );

    const setTheme = useCallback(
        (newTheme: string | ((prev: string) => string)) => {
            if (typeof newTheme === 'function') {
                setThemeState((prevTheme) => {
                    const resolved = newTheme(prevTheme);
                    saveToStorage(storageKey, resolved);
                    return resolved;
                });
            } else {
                setThemeState(newTheme);
                saveToStorage(storageKey, newTheme);
            }
        },
        [storageKey],
    );

    const handleMediaQuery = useCallback(
        (e: MediaQueryListEvent | MediaQueryList) => {
            const systemTheme = getSystemTheme(e);
            setResolvedTheme(systemTheme);

            if (theme === 'system' && enableSystem && !forcedTheme) {
                applyTheme('system');
            }
        },
        [theme, enableSystem, forcedTheme, applyTheme],
    );

    useEffect(() => {
        if (isServer) return;

        const media = window.matchMedia(MEDIA_QUERY);

        if (media.addEventListener) {
            media.addEventListener('change', handleMediaQuery);
            handleMediaQuery(media);
            return () => media.removeEventListener('change', handleMediaQuery);
        } else {
            media.addListener(handleMediaQuery);
            handleMediaQuery(media);
            return () => media.removeListener(handleMediaQuery);
        }
    }, [handleMediaQuery]);

    useEffect(() => {
        if (isServer) return;

        const handleStorage = (e: StorageEvent) => {
            if (e.key !== storageKey) return;

            if (!e.newValue) {
                setTheme(defaultTheme);
            } else {
                setThemeState(e.newValue);
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [setTheme, defaultTheme, storageKey]);

    useEffect(() => {
        if (isServer) return;

        const actualTheme = getTheme(storageKey, defaultTheme) || defaultTheme;
        if (actualTheme !== theme) {
            setThemeState(actualTheme);
        }

        if (actualTheme === 'system') {
            const actualSystemTheme = getSystemTheme();
            if (actualSystemTheme !== resolvedTheme) {
                setResolvedTheme(actualSystemTheme);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        applyTheme(forcedTheme || theme);
    }, [forcedTheme, theme, applyTheme]);

    const contextValue = useMemo(
        () => ({
            theme,
            setTheme,
            forcedTheme,
            resolvedTheme: theme === 'system' ? resolvedTheme : theme,
            themes: enableSystem ? [...DEFAULT_THEMES, 'system'] : DEFAULT_THEMES,
            systemTheme: enableSystem ? (resolvedTheme as 'light' | 'dark') : undefined,
        }),
        [theme, setTheme, forcedTheme, resolvedTheme, enableSystem],
    );

    return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

/* -------------------------------------------------------------------------------------------------
 * useTheme Hook
 * -----------------------------------------------------------------------------------------------*/

const useTheme = (): UseThemeProps => {
    const context = useContext(ThemeContext);
    return context ?? defaultContext;
};

/* -----------------------------------------------------------------------------------------------*/

export { ThemeProvider, useTheme };
export type { ThemeConfig, UseThemeProps, ThemeProviderProps };

export type UseThemeReturn = UseThemeProps;
