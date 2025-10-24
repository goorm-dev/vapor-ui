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
    if (!mounted)
        return (
            <IconButton
                size={size}
                color={color}
                variant="ghost"
                aria-label="light mode"
                className="p-0"
            >
                <DarkIcon />
            </IconButton>
        );

    const toggleTheme = () => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    };

    const getThemeIcon = () => {
        return resolvedTheme === 'dark' ? <LightIcon size={20} /> : <DarkIcon size={20} />;
    };

    const getAriaLabel = () => {
        if (!resolvedTheme) return 'Toggle theme';
        return `Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`;
    };

    return (
        <IconButton
            size={size}
            color={color}
            variant={mounted ? variant : 'fill'}
            aria-label={getAriaLabel()}
            onClick={toggleTheme}
            className="p-0"
        >
            {getThemeIcon()}
        </IconButton>
    );
};
