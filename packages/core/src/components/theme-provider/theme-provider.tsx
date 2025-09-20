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

            d.classList.remove(...DEFAULT_THEMES);
            if (resolved) {
                d.classList.add(resolved);
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
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

/* -----------------------------------------------------------------------------------------------*/
export { ThemeProvider, useTheme };
export type { ThemeConfig, UseThemeProps, ThemeProviderProps };
export type UseThemeReturn = UseThemeProps;
