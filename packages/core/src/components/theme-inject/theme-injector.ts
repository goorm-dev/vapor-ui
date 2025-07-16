const DARK_CLASS_NAME = 'vapor-dark-theme';
const LIGHT_CLASS_NAME = 'vapor-light-theme';

const THEME_CONFIG = {
    STORAGE_KEY: 'vapor-ui-theme',
    CLASS_NAMES: {
        dark: DARK_CLASS_NAME,
        light: LIGHT_CLASS_NAME,
    },
    RADIUS_FACTOR_MAP: {
        none: 0,
        sm: 0.5,
        md: 1,
        lg: 1.5,
        xl: 2,
        full: 3,
    },
} as const;

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

type ThemeConfig = typeof THEME_CONFIG;
type Appearance = keyof typeof THEME_CONFIG.CLASS_NAMES;
type Radius = keyof typeof THEME_CONFIG.RADIUS_FACTOR_MAP;
type Scaling = number;

interface ThemeState {
    appearance: Appearance;
    radius: Radius;
    scaling: Scaling;
    primaryColor?: string;
}

interface CssVarNames {
    radiusFactor: string;
    scaleFactor: string;
    colorBackgroundPrimary: string;
    colorBorderPrimary: string;
    colorForegroundPrimary: string;
    colorForegroundPrimaryDarker: string;
    colorForegroundAccent: string;
    colorBackgroundRgbPrimary: string;
}

/**
 * A self-contained script injected into the HTML to prevent FOUC (Flash of Unstyled Content).
 *
 * @important This function is stringified and executed in an isolated scope.
 * - It cannot have any external dependencies.
 * - Avoid modern JS syntax (e.g., object spread `...`) that might be transpiled
 * into helper functions. These helpers will not be available and will cause
 * a ReferenceError. Use safer alternatives like `Object.assign`.
 */
const themeInjectScript = (
    initialDefaultTheme: ThemeState,
    storageKey: string,
    config: ThemeConfig,
    cssVarNames: CssVarNames,
) => {
    (function () {
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
            const accentColor =
                baseHsl.l > 0.5 ? 'var(--vapor-color-black)' : 'var(--vapor-color-white)';
            const backgroundRgb = hexToRgbString(baseColorHex);

            const commonColors = {
                'vapor-color-foreground-accent': accentColor,
                'vapor-color-background-rgb-primary': backgroundRgb,
            };

            if (mode === 'light') {
                const foregroundHsl = Object.assign({}, baseHsl, {
                    l: Math.max(0, baseHsl.l - 0.08),
                });
                const foregroundDarkerHsl = Object.assign({}, foregroundHsl, {
                    l: Math.max(0, foregroundHsl.l - 0.08),
                });

                return Object.assign(
                    {
                        'vapor-color-background-primary': baseColorHex,
                        'vapor-color-border-primary': baseColorHex,
                        'vapor-color-foreground-primary': hslToHex(foregroundHsl),
                        'vapor-color-foreground-primary-darker': hslToHex(foregroundDarkerHsl),
                    },
                    commonColors,
                );
            } else {
                const foregroundDarkerHsl = Object.assign({}, baseHsl, {
                    l: Math.min(1, baseHsl.l + 0.08),
                });

                return Object.assign(
                    {
                        'vapor-color-background-primary': baseColorHex,
                        'vapor-color-border-primary': baseColorHex,
                        'vapor-color-foreground-primary': baseColorHex,
                        'vapor-color-foreground-primary-darker': hslToHex(foregroundDarkerHsl),
                    },
                    commonColors,
                );
            }
        };

        const root = document.documentElement;
        let currentThemes: ThemeState = initialDefaultTheme;

        try {
            const storedItem = localStorage.getItem(storageKey);
            if (storedItem) {
                const storedSettings = JSON.parse(storedItem);
                // IMPORTANT: Use Object.assign instead of object spread (...) to avoid
                // dependency on transpiled helper functions.
                currentThemes = Object.assign({}, initialDefaultTheme, storedSettings);
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            /* Fails silently */
        }

        try {
            // 1. Apply color theme
            if (currentThemes.appearance === 'dark') {
                root.classList.add(config.CLASS_NAMES.dark);
                root.classList.remove(config.CLASS_NAMES.light);
            } else {
                root.classList.add(config.CLASS_NAMES.light);
                root.classList.remove(config.CLASS_NAMES.dark);
            }

            // 2. Apply radius theme
            const radiusFactor = config.RADIUS_FACTOR_MAP[currentThemes.radius] ?? 1;
            root.style.setProperty(`--${cssVarNames.radiusFactor}`, radiusFactor.toString());

            // 3. Apply scale theme
            const scaleFactor = currentThemes.scaling ?? 1;
            root.style.setProperty(`--${cssVarNames.scaleFactor}`, scaleFactor.toString());

            // 4. Apply primary color variables
            if (currentThemes.primaryColor) {
                const colorSet = calculatePrimaryColorSet(
                    currentThemes.primaryColor,
                    currentThemes.appearance,
                );

                root.style.setProperty(
                    `--${cssVarNames.colorBackgroundPrimary}`,
                    colorSet['vapor-color-background-primary'],
                );
                root.style.setProperty(
                    `--${cssVarNames.colorBorderPrimary}`,
                    colorSet['vapor-color-border-primary'],
                );
                root.style.setProperty(
                    `--${cssVarNames.colorForegroundPrimary}`,
                    colorSet['vapor-color-foreground-primary'],
                );
                root.style.setProperty(
                    `--${cssVarNames.colorForegroundPrimaryDarker}`,
                    colorSet['vapor-color-foreground-primary-darker'],
                );
                root.style.setProperty(
                    `--${cssVarNames.colorForegroundAccent}`,
                    colorSet['vapor-color-foreground-accent'],
                );
                root.style.setProperty(
                    `--${cssVarNames.colorBackgroundRgbPrimary}`,
                    colorSet['vapor-color-background-rgb-primary'],
                );
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            /* Fails silently */
        }
    })();
};

export {
    THEME_CONFIG,
    themeInjectScript,
    type ThemeConfig,
    type Appearance,
    type Radius,
    type Scaling,
    type ThemeState,
};
