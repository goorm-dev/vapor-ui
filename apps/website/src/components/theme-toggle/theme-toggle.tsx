'use client';

import { useEffect, useState } from 'react';

import { IconButton, useTheme } from '@vapor-ui/core';
import { DarkIcon, LightIcon } from '@vapor-ui/icons';

interface ThemeToggleProps {
    size?: 'sm' | 'md' | 'lg';
    color?: 'primary' | 'secondary';
    variant?: 'fill' | 'ghost' | 'outline';
    className?: string;
}

export const ThemeToggle = ({
    size = 'lg',
    color = 'secondary',
    variant = 'ghost',
    className,
}: ThemeToggleProps) => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    // 마운트되기 전에는 기본 아이콘 표시
    if (!mounted) {
        return null;
    }

    return (
        <IconButton
            size={size}
            color={color}
            variant={variant}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            onClick={toggleTheme}
            className={className}
        >
            {theme === 'dark' ? <LightIcon /> : <DarkIcon />}
        </IconButton>
    );
};
