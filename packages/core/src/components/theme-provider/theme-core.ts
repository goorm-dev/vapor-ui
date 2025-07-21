import { RADIUS_FACTOR_VAR_NAME, SCALE_FACTOR_VAR_NAME } from '~/styles/global-var.css';

import { THEME_CONFIG } from '../theme-inject/theme-injector';

const COLOR_BACKGROUND_PRIMARY_VAR_NAME = 'vapor-color-background-primary';
const COLOR_BORDER_PRIMARY_VAR_NAME = 'vapor-color-border-primary';
const COLOR_FOREGROUND_PRIMARY_VAR_NAME = 'vapor-color-foreground-primary';
const COLOR_FOREGROUND_PRIMARY_DARKER_VAR_NAME = 'vapor-color-foreground-primary-darker';
const COLOR_FOREGROUND_ACCENT_VAR_NAME = 'vapor-color-foreground-accent';
const COLOR_BACKGROUND_RGB_PRIMARY_VAR_NAME = 'vapor-color-background-rgb-primary';

export interface PrimaryColorSet {
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

export type Appearance = 'light' | 'dark';
export type Radius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type Scaling = number;

export interface ThemeState {
    appearance: Appearance;
    radius: Radius;
    scaling: Scaling;
    primaryColor?: string; // Hex code
}

interface ThemeControllerOptions {
    target: 'global' | 'local';
    persistence?: boolean;
    storageKey?: string;
    enableSystemTheme?: boolean;
}

interface ThemeControllerResult {
    applyTheme: (element: HTMLElement, theme: ThemeState) => void;
    calculateColors: (hex: string, mode: 'light' | 'dark') => PrimaryColorSet;
    getDefaultTheme: (config?: Partial<ThemeState>) => ThemeState;
    validateConfig: (config: unknown) => boolean;
    setupStorageListener?: (callback: (theme: ThemeState) => void) => () => void;
    constants: {
        COLOR_BACKGROUND_PRIMARY_VAR_NAME: string;
        COLOR_BORDER_PRIMARY_VAR_NAME: string;
        COLOR_FOREGROUND_PRIMARY_VAR_NAME: string;
        COLOR_FOREGROUND_PRIMARY_DARKER_VAR_NAME: string;
        COLOR_FOREGROUND_ACCENT_VAR_NAME: string;
        COLOR_BACKGROUND_RGB_PRIMARY_VAR_NAME: string;
    };
}

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
        const max = Math.max(r, g, b),
            min = Math.min(r, g, b);
        let h = 0,
            s = 0;
        const l = (max + min) / 2;

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

export function validateThemeConfig(config: unknown): config is Partial<ThemeState> {
    if (!config || typeof config !== 'object') return false;

    const c = config as Partial<ThemeState>;

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

export const createThemeController = (options: ThemeControllerOptions): ThemeControllerResult => {
    const applyTheme = (element: HTMLElement, theme: ThemeState) => {
        const { appearance, radius, scaling, primaryColor } = theme;

        // Apply appearance (handled differently for global vs local)
        if (options.target === 'global') {
            // Global: use CSS classes on document.documentElement
            if (appearance === 'dark') {
                element.classList.add(THEME_CONFIG.CLASS_NAMES.dark);
                element.classList.remove(THEME_CONFIG.CLASS_NAMES.light);
            } else {
                element.classList.add(THEME_CONFIG.CLASS_NAMES.light);
                element.classList.remove(THEME_CONFIG.CLASS_NAMES.dark);
            }
        }
        // Local: CSS classes are handled by Vanilla Extract theme classes

        // Apply radius (same for both)
        const radiusFactor = THEME_CONFIG.RADIUS_FACTOR_MAP[radius] ?? 1;
        element.style.setProperty(`--${RADIUS_FACTOR_VAR_NAME}`, radiusFactor.toString());

        // Apply scaling (same for both)
        element.style.setProperty(`--${SCALE_FACTOR_VAR_NAME}`, scaling.toString());

        // Apply primary colors (same logic for both)
        if (primaryColor) {
            const colorSet = calculatePrimaryColorSet(primaryColor, appearance);

            element.style.setProperty(
                `--${COLOR_BACKGROUND_PRIMARY_VAR_NAME}`,
                colorSet['vapor-color-background-primary'],
            );
            element.style.setProperty(
                `--${COLOR_BORDER_PRIMARY_VAR_NAME}`,
                colorSet['vapor-color-border-primary'],
            );
            element.style.setProperty(
                `--${COLOR_FOREGROUND_PRIMARY_VAR_NAME}`,
                colorSet['vapor-color-foreground-primary'],
            );
            element.style.setProperty(
                `--${COLOR_FOREGROUND_PRIMARY_DARKER_VAR_NAME}`,
                colorSet['vapor-color-foreground-primary-darker'],
            );
            element.style.setProperty(
                `--${COLOR_FOREGROUND_ACCENT_VAR_NAME}`,
                colorSet['vapor-color-foreground-accent'],
            );
            element.style.setProperty(
                `--${COLOR_BACKGROUND_RGB_PRIMARY_VAR_NAME}`,
                colorSet['vapor-color-background-rgb-primary'],
            );
        }
    };

    const getDefaultTheme = (config?: Partial<ThemeState>): ThemeState => ({
        appearance: config?.appearance ?? 'light',
        radius: config?.radius ?? 'md',
        scaling: config?.scaling ?? 1,
        primaryColor: config?.primaryColor,
    });

    const setupStorageListener = options.persistence
        ? (callback: (theme: ThemeState) => void) => {
              const handleStorageChange = (event: StorageEvent) => {
                  if (event.key === options.storageKey && event.newValue) {
                      try {
                          callback(JSON.parse(event.newValue));
                      } catch (e) {
                          console.error('[@vapor-ui/core] Error parsing stored theme', e);
                      }
                  }
              };

              window.addEventListener('storage', handleStorageChange);
              return () => window.removeEventListener('storage', handleStorageChange);
          }
        : undefined;

    return {
        applyTheme,
        calculateColors: calculatePrimaryColorSet,
        getDefaultTheme,
        validateConfig: validateThemeConfig,
        setupStorageListener,
        constants: {
            COLOR_BACKGROUND_PRIMARY_VAR_NAME,
            COLOR_BORDER_PRIMARY_VAR_NAME,
            COLOR_FOREGROUND_PRIMARY_VAR_NAME,
            COLOR_FOREGROUND_PRIMARY_DARKER_VAR_NAME,
            COLOR_FOREGROUND_ACCENT_VAR_NAME,
            COLOR_BACKGROUND_RGB_PRIMARY_VAR_NAME,
        },
    };
};
