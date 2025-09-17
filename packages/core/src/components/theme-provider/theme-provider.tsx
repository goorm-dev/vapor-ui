'use client';

import type { ReactNode } from 'react';
import { createContext, memo, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { createThemeConfig, type ThemeConfig, type ResolvedThemeConfig } from '../create-theme-config';
import { generateThemeScript, THEME_CLASSES } from '../theme-inject/theme-injector';

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/

type Appearance = 'light' | 'dark';

interface ThemeState {
    appearance: Appearance;
}

interface ThemeContextValue extends ThemeState {
    setAppearance: (appearance: 'light' | 'dark' | 'system') => void;
    toggleAppearance: () => void;
}

/* -------------------------------------------------------------------------------------------------
 * ThemeProvider (Simplified - Appearance Only)
 * -----------------------------------------------------------------------------------------------*/

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
    config?: ThemeConfig;
}

const ThemeProvider = ({ children, config }: ThemeProviderProps) => {
    const resolvedConfig = useMemo<ResolvedThemeConfig>(() => {
        return createThemeConfig(config);
    }, [config]);

    // Internal state - only appearance
    const [appearance, setAppearanceState] = useState<Appearance>(() => {
        if (typeof window === 'undefined') {
            return 'light';
        }

        // Check system preference if default is 'system'
        if (resolvedConfig.appearance === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        // Load from localStorage
        try {
            const storedItem = localStorage.getItem(resolvedConfig.storageKey);
            if (storedItem) {
                const storedSettings = JSON.parse(storedItem);
                if (storedSettings.appearance) {
                    if (storedSettings.appearance === 'system') {
                        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    }
                    return storedSettings.appearance === 'dark' ? 'dark' : 'light';
                }
            }
        } catch (e) {
            console.error('[@vapor-ui/core] Failed to read theme from localStorage.', e);
        }

        return resolvedConfig.appearance === 'dark' ? 'dark' : 'light';
    });

    // User preference state (can be 'system')
    const [userPreference, setUserPreference] = useState<'light' | 'dark' | 'system'>(() => {
        if (typeof window === 'undefined') {
            return resolvedConfig.appearance;
        }

        try {
            const storedItem = localStorage.getItem(resolvedConfig.storageKey);
            if (storedItem) {
                const storedSettings = JSON.parse(storedItem);
                return storedSettings.appearance || resolvedConfig.appearance;
            }
        } catch (_e) {
            // Ignore errors
        }

        return resolvedConfig.appearance;
    });

    const setAppearance = useCallback(
        (newAppearance: 'light' | 'dark' | 'system') => {
            setUserPreference(newAppearance);

            // Resolve actual appearance
            let resolvedAppearance: Appearance;
            if (newAppearance === 'system') {
                resolvedAppearance = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            } else {
                resolvedAppearance = newAppearance;
            }

            setAppearanceState(resolvedAppearance);

            // Save to localStorage
            try {
                localStorage.setItem(
                    resolvedConfig.storageKey,
                    JSON.stringify({ appearance: newAppearance })
                );
            } catch (e) {
                console.error('[@vapor-ui/core] Could not save theme state to localStorage.', e);
            }
        },
        [resolvedConfig.storageKey],
    );

    const toggleAppearance = useCallback(() => {
        setAppearance(appearance === 'dark' ? 'light' : 'dark');
    }, [appearance, setAppearance]);

    // Listen for theme changes in other tabs
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === resolvedConfig.storageKey && event.newValue) {
                try {
                    const stored = JSON.parse(event.newValue);
                    if (stored.appearance) {
                        setAppearance(stored.appearance);
                    }
                } catch (e) {
                    console.error('[@vapor-ui/core] Error parsing stored theme from storage event.', e);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [resolvedConfig.storageKey, setAppearance]);

    // Listen for system theme changes (only when user preference is 'system')
    useEffect(() => {
        if (!resolvedConfig.enableSystemTheme || userPreference !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            setAppearanceState(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [resolvedConfig.enableSystemTheme, userPreference]);

    // Apply CSS classes to document
    useEffect(() => {
        const root = document.documentElement;
        
        // Remove both classes first
        root.classList.remove(THEME_CLASSES.light, THEME_CLASSES.dark);
        
        // Add the appropriate class
        if (appearance === 'dark') {
            root.classList.add(THEME_CLASSES.dark);
        } else {
            root.classList.add(THEME_CLASSES.light);
        }
    }, [appearance]);

    const contextValue = useMemo(
        () => ({
            appearance,
            setAppearance,
            toggleAppearance,
        }),
        [appearance, setAppearance, toggleAppearance],
    );

    return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

/* -------------------------------------------------------------------------------------------------
 * ThemeScript (Simplified)
 * -----------------------------------------------------------------------------------------------*/

interface ThemeScriptProps {
    config?: ThemeConfig;
}

const ThemeScript = memo(({ config }: ThemeScriptProps) => {
    const resolvedConfig = useMemo<ResolvedThemeConfig>(() => {
        return createThemeConfig(config);
    }, [config]);

    const scriptContent = generateThemeScript(resolvedConfig);

    return (
        <script
            nonce={resolvedConfig.nonce}
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: scriptContent }}
        />
    );
});

ThemeScript.displayName = 'ThemeScript';

/* -------------------------------------------------------------------------------------------------
 * Hook
 * -----------------------------------------------------------------------------------------------*/

const useTheme = (): ThemeContextValue => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('`useTheme` must be used within a `ThemeProvider`.');
    }
    return context;
};

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/

export { ThemeProvider, ThemeScript, useTheme };
export type { ThemeConfig, Appearance, ThemeState };