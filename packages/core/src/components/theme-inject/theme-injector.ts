import type { ThemeConfig } from '../create-theme-config/create-theme-config';

/* -------------------------------------------------------------------------------------------------
 * Theme Script (Simplified - Appearance Toggle Only)
 * -----------------------------------------------------------------------------------------------*/

const THEME_CLASSES = {
    light: 'vapor-light-theme',
    dark: 'vapor-dark-theme',
} as const;

/**
 * A lightweight script injected into the HTML to prevent FOUC (Flash of Unstyled Content).
 * Only handles appearance class toggling.
 *
 * @important This function is stringified and executed in an isolated scope.
 * - It cannot have any external dependencies.
 * - Avoid modern JS syntax that might be transpiled into helper functions.
 */
const themeInjectScript = (
    config: ThemeConfig,
) => {
    (function () {
        const THEME_CLASSES = {
            light: 'vapor-light-theme',
            dark: 'vapor-dark-theme'
        };
        
        let appearance = config.appearance || 'system';
        
        // System theme detection
        if (appearance === 'system') {
            appearance = window.matchMedia('(prefers-color-scheme: dark)').matches 
                ? 'dark' : 'light';
        }
        
        // Load user settings from localStorage
        try {
            const stored = localStorage.getItem(config.storageKey || 'vapor-ui-theme');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.appearance) {
                    appearance = parsed.appearance;
                    
                    // Re-evaluate system theme if needed
                    if (appearance === 'system') {
                        appearance = window.matchMedia('(prefers-color-scheme: dark)').matches 
                            ? 'dark' : 'light';
                    }
                }
            }
        } catch (_e) {
            // Fails silently
        }
        
        // Apply theme class
        try {
            const root = document.documentElement;
            
            // Remove both classes first
            root.classList.remove(THEME_CLASSES.light, THEME_CLASSES.dark);
            
            // Add the appropriate class
            if (appearance === 'dark') {
                root.classList.add(THEME_CLASSES.dark);
            } else {
                root.classList.add(THEME_CLASSES.light);
            }
        } catch (_e) {
            // Fails silently
        }
    })();
};

/**
 * Generates the theme script content for injection into HTML
 */
export const generateThemeScript = (config: ThemeConfig): string => {
    const scriptContent = `(${themeInjectScript.toString()})(${JSON.stringify(config)})`;
    return scriptContent;
};

export { THEME_CLASSES };
export type { ThemeConfig as ThemeInjectorConfig };