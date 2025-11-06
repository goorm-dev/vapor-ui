'use client';

import { IconButton, useTheme } from '@vapor-ui/core';
import { DarkIcon, LightIcon } from '@vapor-ui/icons';

interface ThemeToggleProps {
    size?: 'sm' | 'md' | 'lg';
    color?: 'primary' | 'secondary';
    variant?: 'fill' | 'ghost' | 'outline';
}

export const ThemeToggle = ({
    size = 'lg',
    color = 'secondary',
    variant = 'ghost',
}: ThemeToggleProps) => {
    const { resolvedTheme, setTheme, mounted } = useTheme();

    const toggleTheme = () => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    };

    const getThemeIcon = () => {
        if (!mounted || !resolvedTheme) return '';
        return resolvedTheme === 'dark' ? <LightIcon /> : <DarkIcon />;
    };

    const getAriaLabel = () => {
        if (!resolvedTheme) return 'Toggle theme';
        return `Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`;
    };

    return (
        <IconButton
            size={size}
            colorPalette={color}
            variant={mounted ? variant : 'fill'}
            aria-label={getAriaLabel()}
            onClick={toggleTheme}
        >
            {getThemeIcon()}
        </IconButton>
    );
};
