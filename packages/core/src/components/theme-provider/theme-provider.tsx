'use client';

import type { ReactNode } from 'react';
import { createContext, memo, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { RADIUS_FACTOR_VAR_NAME, SCALE_FACTOR_VAR_NAME } from '~/styles/global-var.css';

import { createThemeConfig } from '../create-theme-config';
import { THEME_CONFIG, themeInjectScript } from '../theme-inject/theme-injector';
import {
    type Appearance,
    type Radius,
    type Scaling,
    type ThemeState,
    createThemeController,
} from './theme-core';

interface VaporThemeConfig extends Partial<ThemeState> {
    /** localStorage key for persistence. */
    storageKey?: string;
    /** CSP nonce value. */
    nonce?: string;
    /** Enable system theme detection (for future extension). */
    enableSystemTheme?: boolean;
}
interface ResolvedThemeConfig extends ThemeState {
    storageKey: string;
    nonce?: string;
    enableSystemTheme: boolean;
}

// --- ThemeProvider -----------------------------------------------------------------

interface ThemeContextValue extends ThemeState {
    setTheme: (newTheme: Partial<ThemeState>) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
    config?: VaporThemeConfig;
}

const ThemeProvider = ({ children, config }: ThemeProviderProps) => {
    const resolvedConfig = useMemo<ResolvedThemeConfig>(() => {
        return createThemeConfig(config);
    }, [config]);

    // Create theme controller with global configuration
    const controller = useMemo(
        () =>
            createThemeController({
                target: 'global',
                persistence: true,
                storageKey: resolvedConfig.storageKey,
                enableSystemTheme: resolvedConfig.enableSystemTheme,
            }),
        [resolvedConfig.storageKey, resolvedConfig.enableSystemTheme],
    );

    const [themeState, internalSetThemeState] = useState<ThemeState>(() => {
        const { storageKey, nonce, enableSystemTheme, ...defaultTheme } = resolvedConfig;
        const defaultState = controller.getDefaultTheme(defaultTheme);

        if (typeof window === 'undefined') {
            return defaultState;
        }

        try {
            const storedItem = localStorage.getItem(resolvedConfig.storageKey);
            const storedSettings = storedItem ? JSON.parse(storedItem) : {};
            return { ...defaultState, ...storedSettings };
        } catch (e) {
            console.error('[@vapor-ui/core] Failed to read theme from localStorage.', e);
            return defaultState;
        }
    });

    const setTheme = useCallback(
        (newThemePartial: Partial<ThemeState>) => {
            if (config && !controller.validateConfig({ ...config, ...newThemePartial })) {
                return;
            }

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
        [resolvedConfig.storageKey, controller, config],
    );

    // Listen for theme changes in other tabs
    useEffect(() => {
        if (controller.setupStorageListener) {
            return controller.setupStorageListener(internalSetThemeState);
        }
    }, [controller]);

    // Apply theme changes to the DOM
    useEffect(() => {
        controller.applyTheme(document.documentElement, themeState);
    }, [themeState, controller]);

    const contextValue = useMemo(() => ({ ...themeState, setTheme }), [themeState, setTheme]);

    return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

// --- ThemeScript -------------------------------------------------------------------

interface ThemeScriptProps {
    config?: VaporThemeConfig;
}

const ThemeScript = memo(({ config }: ThemeScriptProps) => {
    const resolvedConfig = useMemo<ResolvedThemeConfig>(() => {
        return createThemeConfig(config);
    }, [config]);

    const controller = createThemeController({ target: 'global', persistence: false });

    const cssVarNames = {
        radiusFactor: RADIUS_FACTOR_VAR_NAME,
        scaleFactor: SCALE_FACTOR_VAR_NAME,
        colorBackgroundPrimary: controller.constants.COLOR_BACKGROUND_PRIMARY_VAR_NAME,
        colorBorderPrimary: controller.constants.COLOR_BORDER_PRIMARY_VAR_NAME,
        colorForegroundPrimary: controller.constants.COLOR_FOREGROUND_PRIMARY_VAR_NAME,
        colorForegroundPrimaryDarker: controller.constants.COLOR_FOREGROUND_PRIMARY_DARKER_VAR_NAME,
        colorForegroundAccent: controller.constants.COLOR_FOREGROUND_ACCENT_VAR_NAME,
        colorBackgroundRgbPrimary: controller.constants.COLOR_BACKGROUND_RGB_PRIMARY_VAR_NAME,
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

// --- Hooks -------------------------------------------------------------------------

const useTheme = (): ThemeContextValue => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('`useTheme` must be used within a `ThemeProvider`.');
    }
    return context;
};

// --- Exports -----------------------------------------------------------------------

export { ThemeProvider, ThemeScript, useTheme };
export type { VaporThemeConfig, ThemeState, Appearance, Radius, Scaling };
