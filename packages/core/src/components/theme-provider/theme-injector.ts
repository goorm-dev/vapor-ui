const THEME_CONFIG = {
    STORAGE_KEY: 'vapor-ui-theme',
    CLASS_NAMES: {
        dark: 'vapor-dark-theme',
        light: 'vapor-light-theme',
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
type ColorTheme = keyof typeof THEME_CONFIG.CLASS_NAMES;
type RadiusTheme = keyof typeof THEME_CONFIG.RADIUS_FACTOR_MAP;
type ScaleFactor = number;

interface ThemeState {
    colorTheme: ColorTheme;
    radiusTheme: RadiusTheme;
    scaleFactor: ScaleFactor;
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
            if (currentThemes.colorTheme === 'dark') {
                root.classList.add(config.CLASS_NAMES.dark);
                root.classList.remove(config.CLASS_NAMES.light);
            } else {
                root.classList.add(config.CLASS_NAMES.light);
                root.classList.remove(config.CLASS_NAMES.dark);
            }

            // 2. Radius theme
            const radiusFactor = config.RADIUS_FACTOR_MAP[currentThemes.radiusTheme] ?? 1;
            root.style.setProperty(`--${cssVarNames.radiusFactor}`, radiusFactor.toString());

            // 3. Scale theme
            const scaleFactor = currentThemes.scaleFactor ?? 1;
            root.style.setProperty(`--${cssVarNames.scaleFactor}`, scaleFactor.toString());

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            // Fails silently if DOM manipulation fails in an unsupported browser.
            // This prevents the script from breaking page rendering.
        }
    })();
};

export {
    THEME_CONFIG,
    themeInjectScript,
    type ThemeConfig,
    type ColorTheme,
    type RadiusTheme,
    type ScaleFactor,
    type ThemeState,
};
