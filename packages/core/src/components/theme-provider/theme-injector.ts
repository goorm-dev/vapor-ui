/* -------------------------------------------------------------------------------------------------
 * Constants & Core Types
 * -----------------------------------------------------------------------------------------------*/
const DEFAULT_THEME: ThemeState = {
    appearance: 'light',
    radius: 'md',
    scaling: 1,
};

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

type ThemeConfig = typeof THEME_CONFIG;
type Appearance = keyof typeof THEME_CONFIG.CLASS_NAMES;
type Radius = keyof typeof THEME_CONFIG.RADIUS_FACTOR_MAP;
type Scaling = number;

interface VaporThemeConfig extends Partial<ThemeState> {
    /** localStorage key for persistence */
    storageKey?: string;
    /** CSP nonce value */
    nonce?: string;
    /** Enable system theme detection (for future extension) */
    enableSystemTheme?: boolean;
}
interface ResolvedThemeConfig extends ThemeState {
    storageKey: string;
    nonce?: string;
    enableSystemTheme: boolean;
}
interface ThemeState {
    appearance: Appearance;
    radius: Radius;
    scaling: Scaling;
}

/**
 * @purpose
 * This function is injected directly into the browser as an inline script to prevent FOUC.
 * It must be self-contained and dependency-free.
 *
 * @description
 * This function is converted to a string using `.toString()` before being injected.
 * Our build process targets 'es6'. Certain modern syntax features (like object spread `...`)
 * are transpiled by `tsup` into helper functions. These helpers will NOT be available
 * in the isolated scope of this inline script, which would cause a ReferenceError.
 *
 * @caveats
 * To avoid this issue, only use JavaScript syntax that is either native to ES6
 * or is guaranteed not to produce external helper functions after transpilation.
 * For example, use `Object.assign` for merging objects instead of the spread operator.
 */
const themeInjectScript = (
    initialDefaultTheme: ThemeState,
    storageKey: string,
    config: ThemeConfig,
    cssVarNames: { radiusFactor: string; scaleFactor: string },
) => {
    (function () {
        // This code runs immediately in the <head> to prevent FOUC (Flash of Unstyled Content).
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
            // Fails silently if localStorage is disabled or corrupted.
            // The default theme will be used as a fallback.
        }

        try {
            // 1. Color theme
            if (currentThemes.appearance === 'dark') {
                root.classList.add(config.CLASS_NAMES.dark);
                root.classList.remove(config.CLASS_NAMES.light);
            } else {
                root.classList.add(config.CLASS_NAMES.light);
                root.classList.remove(config.CLASS_NAMES.dark);
            }

            // 2. Radius theme
            const radiusFactor = config.RADIUS_FACTOR_MAP[currentThemes.radius] ?? 1;
            root.style.setProperty(`--${cssVarNames.radiusFactor}`, radiusFactor.toString());

            // 3. Scale theme
            const scaleFactor = currentThemes.scaling ?? 1;
            root.style.setProperty(`--${cssVarNames.scaleFactor}`, scaleFactor.toString());

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            // Fails silently if DOM manipulation fails in an unsupported browser.
            // This prevents the script from breaking page rendering.
        }
    })();
};

/**
 * Creates a complete configuration object by merging user config with defaults
 *
 * @example
 * ```tsx
 * const config = createThemeConfig({
 *   appearance: 'dark',
 *   storageKey: 'my-app-theme'
 * });
 * ```
 */
const createThemeConfig = (userConfig?: VaporThemeConfig): ResolvedThemeConfig => {
    const {
        storageKey = THEME_CONFIG.STORAGE_KEY,
        nonce,
        enableSystemTheme = false,
        ...themeProps
    } = userConfig ?? {};

    return {
        ...DEFAULT_THEME,
        ...themeProps,
        storageKey,
        nonce,
        enableSystemTheme,
    };
};

export {
    THEME_CONFIG,
    themeInjectScript,
    createThemeConfig,
    type ThemeConfig,
    type Appearance,
    type Radius,
    type Scaling,
    type ThemeState,
};
