'use client';

import type { ReactNode } from 'react';
import { createContext, memo, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { RADIUS_FACTOR_VAR_NAME, SCALE_FACTOR_VAR_NAME } from '~/styles/global-var.css';

import { createThemeConfig } from '../create-theme-config';
import { THEME_CONFIG, themeInjectScript } from '../theme-inject/theme-injector';

const COLOR_BACKGROUND_PRIMARY_VAR_NAME = 'vapor-color-background-primary';
const COLOR_BORDER_PRIMARY_VAR_NAME = 'vapor-color-border-primary';
const COLOR_FOREGROUND_PRIMARY_VAR_NAME = 'vapor-color-foreground-primary';
const COLOR_FOREGROUND_PRIMARY_DARKER_VAR_NAME = 'vapor-color-foreground-primary-darker';
const COLOR_FOREGROUND_ACCENT_VAR_NAME = 'vapor-color-foreground-accent';
const COLOR_BACKGROUND_RGB_PRIMARY_VAR_NAME = 'vapor-color-background-rgb-primary';

interface PrimaryColorSet {
    'vapor-color-background-primary': string;
    'vapor-color-border-primary': string;
    'vapor-color-foreground-primary': string;
    'vapor-color-foreground-primary-darker': string;
    'vapor-color-foreground-accent': string;
    'vapor-color-background-rgb-primary': string;
}

interface HSL {
    h: number; // 0-360
    s: number; // 0-1
    l: number; // 0-1
}

type Appearance = 'light' | 'dark';
type Radius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
type Scaling = number;

/**
 * Calculates a set of primary color tokens based on a single hex color and a mode.
 * @param baseColorHex The base color in hex format (e.g., '#2A6FF3').
 * @param mode The color mode, either 'light' or 'dark'.
 * @returns A `PrimaryColorSet` object with calculated color values.
 */
const calculatePrimaryColorSet = (
    baseColorHex: string,
    mode: 'light' | 'dark',
): PrimaryColorSet => {
    const hexToHsl = (hex: string): HSL => {
        let r = 0,
            g = 0,
            b = 0;
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7) {
            r = parseInt(hex.substring(1, 3), 16);
            g = parseInt(hex.substring(3, 5), 16);
            b = parseInt(hex.substring(5, 7), 16);
        }

        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const l = (max + min) / 2;
        let h = 0;
        let s = 0;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        return { h: h * 360, s, l };
    };

    const hslToHex = (hsl: HSL): string => {
        const { h, s, l } = hsl;
        let r, g, b;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p: number, q: number, t: number) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h / 360 + 1 / 3);
            g = hue2rgb(p, q, h / 360);
            b = hue2rgb(p, q, h / 360 - 1 / 3);
        }
        const toHex = (x: number) => {
            const hex = Math.round(x * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };

    const hexToRgbString = (hex: string): string => {
        let r = 0,
            g = 0,
            b = 0;
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7) {
            r = parseInt(hex.substring(1, 3), 16);
            g = parseInt(hex.substring(3, 5), 16);
            b = parseInt(hex.substring(5, 7), 16);
        }
        return `${r}, ${g}, ${b}`;
    };

    const baseHsl = hexToHsl(baseColorHex);

    // Set accent color: dark for light mode, light for dark mode.
    const accentColor = baseHsl.l > 0.5 ? 'var(--vapor-color-black)' : 'var(--vapor-color-white)';
    const backgroundRgb = hexToRgbString(baseColorHex);

    const commonColors = {
        'vapor-color-foreground-accent': accentColor,
        'vapor-color-background-rgb-primary': backgroundRgb,
    };

    if (mode === 'light') {
        const foregroundHsl: HSL = { ...baseHsl, l: Math.max(0, baseHsl.l - 0.08) };
        const foregroundDarkerHsl: HSL = {
            ...foregroundHsl,
            l: Math.max(0, foregroundHsl.l - 0.08),
        };

        return {
            'vapor-color-background-primary': baseColorHex,
            'vapor-color-border-primary': baseColorHex,
            'vapor-color-foreground-primary': hslToHex(foregroundHsl),
            'vapor-color-foreground-primary-darker': hslToHex(foregroundDarkerHsl),
            ...commonColors,
        };
    } else {
        const foregroundDarkerHsl: HSL = { ...baseHsl, l: Math.min(1, baseHsl.l + 0.08) };

        return {
            'vapor-color-background-primary': baseColorHex,
            'vapor-color-border-primary': baseColorHex,
            'vapor-color-foreground-primary': baseColorHex,
            'vapor-color-foreground-primary-darker': hslToHex(foregroundDarkerHsl),
            ...commonColors,
        };
    }
};

interface ThemeState {
    appearance: Appearance;
    radius: Radius;
    scaling: Scaling;
    primaryColor?: string; // Hex code
}
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
    if (
        c.primaryColor !== undefined &&
        !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(c.primaryColor)
    ) {
        console.warn(
            '[@vapor-ui/core] Invalid primaryColor. Expected a valid hex code (e.g., "#RRGGBB").',
        );
        return false;
    }
    return true;
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
        if (config) {
            validateThemeConfig(config);
        }
        return createThemeConfig(config);
    }, [config]);

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

    // Listen for theme changes in other tabs
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

    // Apply theme changes to the DOM
    useEffect(() => {
        const root = document.documentElement;
        const { appearance, radius, scaling, primaryColor } = themeState;

        // 1. Apply color theme class
        if (appearance === 'dark') {
            root.classList.add(THEME_CONFIG.CLASS_NAMES.dark);
            root.classList.remove(THEME_CONFIG.CLASS_NAMES.light);
        } else {
            root.classList.add(THEME_CONFIG.CLASS_NAMES.light);
            root.classList.remove(THEME_CONFIG.CLASS_NAMES.dark);
        }

        // 2. Apply radius theme
        const radiusFactor = THEME_CONFIG.RADIUS_FACTOR_MAP[radius] ?? 1;
        root.style.setProperty(`--${RADIUS_FACTOR_VAR_NAME}`, radiusFactor.toString());

        // 3. Apply scale theme
        const currentScaleFactor = scaling ?? 1;
        root.style.setProperty(`--${SCALE_FACTOR_VAR_NAME}`, currentScaleFactor.toString());

        // 4. Apply primary color
        if (primaryColor) {
            const colorSet = calculatePrimaryColorSet(primaryColor, appearance);

            root.style.setProperty(
                `--${COLOR_BACKGROUND_PRIMARY_VAR_NAME}`,
                colorSet['vapor-color-background-primary'],
            );
            root.style.setProperty(
                `--${COLOR_BORDER_PRIMARY_VAR_NAME}`,
                colorSet['vapor-color-border-primary'],
            );
            root.style.setProperty(
                `--${COLOR_FOREGROUND_PRIMARY_VAR_NAME}`,
                colorSet['vapor-color-foreground-primary'],
            );
            root.style.setProperty(
                `--${COLOR_FOREGROUND_PRIMARY_DARKER_VAR_NAME}`,
                colorSet['vapor-color-foreground-primary-darker'],
            );
            root.style.setProperty(
                `--${COLOR_FOREGROUND_ACCENT_VAR_NAME}`,
                colorSet['vapor-color-foreground-accent'],
            );
            root.style.setProperty(
                `--${COLOR_BACKGROUND_RGB_PRIMARY_VAR_NAME}`,
                colorSet['vapor-color-background-rgb-primary'],
            );
        }
    }, [themeState]);

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

    const cssVarNames = {
        radiusFactor: RADIUS_FACTOR_VAR_NAME,
        scaleFactor: SCALE_FACTOR_VAR_NAME,
        colorBackgroundPrimary: COLOR_BACKGROUND_PRIMARY_VAR_NAME,
        colorBorderPrimary: COLOR_BORDER_PRIMARY_VAR_NAME,
        colorForegroundPrimary: COLOR_FOREGROUND_PRIMARY_VAR_NAME,
        colorForegroundPrimaryDarker: COLOR_FOREGROUND_PRIMARY_DARKER_VAR_NAME,
        colorForegroundAccent: COLOR_FOREGROUND_ACCENT_VAR_NAME,
        colorBackgroundRgbPrimary: COLOR_BACKGROUND_RGB_PRIMARY_VAR_NAME,
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
