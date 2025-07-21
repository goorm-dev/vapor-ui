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

import { darkThemeClass, lightThemeClass } from '~/styles/local-theme.css';

import { createThemeController, type Appearance, type Radius, type Scaling, type ThemeState } from '../theme-provider/theme-core';

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

    // Create theme controller with local configuration
    const controller = useMemo(() => createThemeController({
        target: 'local',
        persistence: false, // No localStorage for local themes
    }), []);

    const [themeState, setThemeState] = useState<LocalThemeState>(() => 
        controller.getDefaultTheme(config) as LocalThemeState
    );

    const setTheme = useCallback((newThemePartial: Partial<LocalThemeState>) => {
        if (config && !controller.validateConfig({ ...config, ...newThemePartial })) {
            return;
        }
        setThemeState((prevState) => ({ ...prevState, ...newThemePartial }));
    }, [controller, config]);

    // Update theme state when config prop changes
    useEffect(() => {
        if (config) {
            setThemeState((prevState) => ({
                ...prevState,
                ...controller.getDefaultTheme(config),
            }));
        }
    }, [config, controller]);

    // Apply theme changes to the container
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        controller.applyTheme(container, themeState as ThemeState);
    }, [themeState, controller]);

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