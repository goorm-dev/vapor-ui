'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

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
type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';
interface ThemeConfig {
    /**
     * Theme applied when no theme has been saved with `setTheme`. `'light'` and `'dark'` always use that theme; `'system'` follows the operating system's color scheme and updates when it changes.
     */
    defaultTheme?: Theme;

    /**
     * `localStorage` key the theme is saved under. The theme is saved only when `setTheme` is called, and a saved theme takes precedence over `defaultTheme`. Changes to this key from other browser tabs are applied too.
     */
    storageKey?: string;

    /**
     * Theme that is always applied, overriding both the saved theme and `defaultTheme`.
     */
    forcedTheme?: Theme;

    /**
     * Disables CSS transitions while the theme changes, so colors switch without animating.
     */
    disableTransitionOnChange?: boolean;

    /**
     * Sets the CSS `color-scheme` property on the `<html>` element to match the applied theme.
     */
    enableColorScheme?: boolean;

    /**
     * Nonce for Content Security Policy, added to the `<style>` element injected while transitions are disabled.
     */
    nonce?: string;
}

interface UseThemeProps {
    /**
     * Current theme setting, which can be `'system'`. `undefined` until the provider mounts.
     */
    theme?: Theme;

    /**
     * Changes the theme and saves it to `localStorage`. Accepts a theme, or a function that receives the previous theme and returns the next one.
     */
    setTheme: (theme: Theme | ((prev: Theme) => Theme)) => void;

    /**
     * Resets the theme to `defaultTheme` and removes the saved theme from `localStorage`.
     */
    resetTheme: () => void;

    /**
     * Theme forced on the provider, which overrides every other setting.
     */
    forcedTheme?: Theme;

    /**
     * Light or dark theme that the current theme setting resolves to, with `'system'` resolved from the operating system's color scheme. `undefined` until the provider mounts.
     */
    resolvedTheme?: ResolvedTheme;

    /**
     * Every theme value that `setTheme` accepts.
     */
    themes: Theme[];

    /**
     * Operating system's color scheme. Provided only while the theme setting is `'system'` and the provider has mounted.
     */
    systemTheme?: ResolvedTheme;

    /**
     * Whether the provider has mounted on the client.
     */
    mounted?: boolean;
}

interface ThemeProviderProps extends ThemeConfig {
    /**
     * Content the theme applies to, such as the whole app.
     */
    children: React.ReactNode;
}

/* -------------------------------------------------------------------------------------------------
 * Constants
 * -----------------------------------------------------------------------------------------------*/
const MEDIA_QUERY = '(prefers-color-scheme: dark)';
const RESOLVED_THEMES: ResolvedTheme[] = ['light', 'dark'];
const THEME_LIST: Theme[] = ['light', 'dark', 'system'];

/* -------------------------------------------------------------------------------------------------
 * Utilities
 * -----------------------------------------------------------------------------------------------*/
const getTheme = (storageKey: string, defaultTheme?: Theme): Theme | undefined => {
    try {
        const stored = localStorage.getItem(storageKey);
        return (stored as Theme) || defaultTheme;
    } catch {
        return defaultTheme;
    }
};

const getSystemTheme = (e?: MediaQueryList | MediaQueryListEvent): ResolvedTheme => {
    if (!e) {
        if (typeof window === 'undefined') return 'light';
        e = window.matchMedia(MEDIA_QUERY);
    }
    return e.matches ? 'dark' : 'light';
};

const saveToStorage = (storageKey: string, value: Theme): void => {
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

/**
 * Applies a light or dark theme to the page and shares it with `useTheme`. A `ThemeProvider` nested inside another only renders its children. Doesn't render its own HTML element.
 */
const ThemeProvider = (props: ThemeProviderProps) => {
    const context = useContext(ThemeContext);

    // NOTE: Preventing nested ThemeProviders
    if (context) return <>{props.children}</>;
    return <Theme {...props} />;
};

const Theme = ({
    children,
    defaultTheme = 'system',
    storageKey = 'vapor-ui-theme',
    forcedTheme,
    disableTransitionOnChange = false,
    enableColorScheme = true,
    nonce,
}: ThemeProviderProps) => {
    const [mounted, setMounted] = useState(false);
    const [theme, setThemeState] = useState<Theme>(
        () => getTheme(storageKey, defaultTheme) || defaultTheme,
    );
    const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
        const initialTheme = getTheme(storageKey, defaultTheme) || defaultTheme;
        return initialTheme === 'system' ? getSystemTheme() : (initialTheme as ResolvedTheme);
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    const applyTheme = useCallback(
        (newTheme: Theme) => {
            let resolved = newTheme;
            if (newTheme === 'system') {
                resolved = getSystemTheme();
            }

            const enableTransition = disableTransitionOnChange ? disableAnimation(nonce) : null;
            const d = document.documentElement;

            if (resolved === 'dark') {
                d.setAttribute('data-vapor-theme', 'dark');
            } else {
                d.setAttribute('data-vapor-theme', 'light');
            }

            if (enableColorScheme) {
                const fallback = RESOLVED_THEMES.includes(defaultTheme as ResolvedTheme)
                    ? defaultTheme
                    : null;
                const colorScheme = RESOLVED_THEMES.includes(resolved as ResolvedTheme)
                    ? resolved
                    : fallback;
                d.style.colorScheme = colorScheme || '';
            }

            enableTransition?.();
        },
        [enableColorScheme, defaultTheme, disableTransitionOnChange, nonce],
    );

    const setTheme = useCallback(
        (newTheme: Theme | ((prev: Theme) => Theme)) => {
            const resolvedTheme = typeof newTheme === 'function' ? newTheme(theme) : newTheme;
            setThemeState(resolvedTheme);
            saveToStorage(storageKey, resolvedTheme);
        },
        [storageKey, theme],
    );

    const resetTheme = useCallback(() => {
        try {
            localStorage.removeItem(storageKey);
        } catch {}
        setThemeState(defaultTheme);
    }, [storageKey, defaultTheme]);

    const handleMediaQuery = useCallback(
        (e: MediaQueryListEvent | MediaQueryList) => {
            const systemTheme = getSystemTheme(e);
            setResolvedTheme(systemTheme);
            if (theme === 'system' && !forcedTheme) {
                applyTheme(systemTheme);
            }
        },
        [theme, forcedTheme, applyTheme],
    );

    useEffect(() => {
        if (theme === 'system') {
            const media = window.matchMedia(MEDIA_QUERY);
            media.addEventListener('change', handleMediaQuery);
            handleMediaQuery(media);
            return () => media.removeEventListener('change', handleMediaQuery);
        }
    }, [theme, handleMediaQuery]);

    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === storageKey) {
                const newTheme = (e.newValue as Theme) || defaultTheme;
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
            theme: mounted ? theme : undefined,
            setTheme,
            resetTheme,
            forcedTheme,
            resolvedTheme: mounted
                ? theme === 'system'
                    ? resolvedTheme
                    : (theme as ResolvedTheme)
                : undefined,
            themes: THEME_LIST,
            systemTheme: mounted && theme === 'system' ? resolvedTheme : undefined,
            mounted,
        }),
        [theme, setTheme, resetTheme, forcedTheme, resolvedTheme, mounted],
    );

    return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

/* -------------------------------------------------------------------------------------------------
 * useTheme Hook
 * -----------------------------------------------------------------------------------------------*/
/**
 * Returns the current theme and functions to change it. Throws when used outside a `ThemeProvider`.
 */
const useTheme = (): UseThemeProps => {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }

    return context;
};

/* -------------------------------------------------------------------------------------------------
 * Local Theme Scope
 * -----------------------------------------------------------------------------------------------*/
interface ThemeScopeProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Content shown with the scoped theme, such as a section of the page.
     */
    children: React.ReactNode;
    /**
     * The theme to force upon this scope, ignoring the global theme.
     */
    forcedTheme: ResolvedTheme;
}

/**
 * Applies a fixed light or dark theme to a section of the page, regardless of the global theme. Renders a `<div>` element.
 */
const ThemeScope = ({ children, forcedTheme, style, ...rest }: ThemeScopeProps) => {
    return (
        <div
            data-vapor-theme={forcedTheme}
            style={{ colorScheme: forcedTheme, ...style }}
            {...rest}
        >
            {children}
        </div>
    );
};

/* -----------------------------------------------------------------------------------------------*/
export { ThemeProvider, ThemeScope, useTheme };
export type { ThemeConfig, UseThemeProps, ThemeProviderProps, ThemeScopeProps };
export type UseThemeReturn = UseThemeProps;
