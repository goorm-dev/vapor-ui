'use client';

import type { ReactNode } from 'react';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import clsx from 'clsx';

import { RADIUS_FACTOR_VAR_NAME, SCALE_FACTOR_VAR_NAME } from '~/styles/global-var.css';
import { darkThemeClass, lightThemeClass } from '~/styles/local-theme.css';

import { THEME_CONFIG } from '../theme-inject/theme-injector';

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
        const max = Math.max(r, g, b),
            min = Math.min(r, g, b);
        let h = 0,
            s = 0,
            l = (max + min) / 2;

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

interface LocalThemeState {
    appearance: Appearance;
    radius: Radius;
    scaling: Scaling;
    primaryColor?: string; // Hex code
}

interface LocalThemeConfig extends Partial<LocalThemeState> {}

interface LocalThemeContextValue extends LocalThemeState {
    setTheme: (newTheme: Partial<LocalThemeState>) => void;
}

const LocalThemeContext = createContext<LocalThemeContextValue | undefined>(undefined);

interface LocalThemeProviderProps {
    children: ReactNode;
    config?: LocalThemeConfig;
    className?: string;
}

const LocalThemeProvider = ({ children, config, className = '' }: LocalThemeProviderProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const [themeState, setThemeState] = useState<LocalThemeState>(() => ({
        appearance: config?.appearance ?? 'light',
        radius: config?.radius ?? 'md',
        scaling: config?.scaling ?? 1,
        primaryColor: config?.primaryColor,
    }));

    const setTheme = useCallback((newThemePartial: Partial<LocalThemeState>) => {
        setThemeState((prevState) => ({ ...prevState, ...newThemePartial }));
    }, []);

    // Update theme state when config prop changes
    useEffect(() => {
        if (config) {
            setThemeState((prevState) => ({
                ...prevState,
                appearance: config.appearance ?? prevState.appearance,
                radius: config.radius ?? prevState.radius,
                scaling: config.scaling ?? prevState.scaling,
                primaryColor: config.primaryColor ?? prevState.primaryColor,
            }));
        }
    }, [config]);

    // Apply theme changes to the container
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const { appearance, radius, scaling, primaryColor } = themeState;

        // 1. Apply radius theme
        const radiusFactor = THEME_CONFIG.RADIUS_FACTOR_MAP[radius] ?? 1;
        container.style.setProperty(`--${RADIUS_FACTOR_VAR_NAME}`, radiusFactor.toString());

        // 2. Apply scale theme
        const currentScaleFactor = scaling ?? 1;
        container.style.setProperty(`--${SCALE_FACTOR_VAR_NAME}`, currentScaleFactor.toString());

        // 3. Apply primary color
        if (primaryColor) {
            const colorSet = calculatePrimaryColorSet(primaryColor, appearance);

            container.style.setProperty(
                `--${COLOR_BACKGROUND_PRIMARY_VAR_NAME}`,
                colorSet['vapor-color-background-primary'],
            );
            container.style.setProperty(
                `--${COLOR_BORDER_PRIMARY_VAR_NAME}`,
                colorSet['vapor-color-border-primary'],
            );
            container.style.setProperty(
                `--${COLOR_FOREGROUND_PRIMARY_VAR_NAME}`,
                colorSet['vapor-color-foreground-primary'],
            );
            container.style.setProperty(
                `--${COLOR_FOREGROUND_PRIMARY_DARKER_VAR_NAME}`,
                colorSet['vapor-color-foreground-primary-darker'],
            );
            container.style.setProperty(
                `--${COLOR_FOREGROUND_ACCENT_VAR_NAME}`,
                colorSet['vapor-color-foreground-accent'],
            );
            container.style.setProperty(
                `--${COLOR_BACKGROUND_RGB_PRIMARY_VAR_NAME}`,
                colorSet['vapor-color-background-rgb-primary'],
            );
        }
    }, [themeState]);

    const contextValue = useMemo(() => ({ ...themeState, setTheme }), [themeState, setTheme]);

    const themeClass = themeState.appearance === 'dark' ? darkThemeClass : lightThemeClass;

    return (
        <LocalThemeContext.Provider value={contextValue}>
            <div ref={containerRef} className={clsx(themeClass, className)}>
                {children}
            </div>
        </LocalThemeContext.Provider>
    );
};

const useLocalTheme = (): LocalThemeContextValue => {
    const context = useContext(LocalThemeContext);
    if (context === undefined) {
        throw new Error('`useLocalTheme` must be used within a `LocalThemeProvider`.');
    }
    return context;
};

export { LocalThemeProvider, useLocalTheme };
export type { LocalThemeConfig, LocalThemeState, Appearance, Radius, Scaling };
