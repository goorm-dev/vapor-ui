'use client';

import { useState } from 'react';

import { Button } from '@vapor-ui/core';
import { DarkIcon, LightIcon } from '@vapor-ui/icons';

interface ThemeToggleProps {
    onThemeChange?: (theme: 'light' | 'dark') => void;
    defaultTheme?: 'light' | 'dark';
}

export function ThemeToggle({ onThemeChange, defaultTheme = 'dark' }: ThemeToggleProps) {
    const [appearance, setAppearance] = useState<'light' | 'dark'>(defaultTheme);

    const handleThemeChange = (theme: 'light' | 'dark') => {
        setAppearance(theme);
        onThemeChange?.(theme);
    };

    return (
        <div className="flex items-center border border-[var(--vapor-color-border-normal)] rounded-[var(--vapor-size-borderRadius-300)] p-1">
            <Button
                size="md"
                color={appearance === 'light' ? 'primary' : 'secondary'}
                variant={appearance === 'light' ? 'solid' : 'ghost'}
                onClick={() => handleThemeChange('light')}
                className="flex items-center gap-1"
            >
                <LightIcon />
                Light
            </Button>
            <Button
                size="md"
                color={appearance === 'dark' ? 'primary' : 'secondary'}
                variant={appearance === 'dark' ? 'solid' : 'ghost'}
                onClick={() => handleThemeChange('dark')}
                className="flex items-center gap-1"
            >
                <DarkIcon />
                Dark
            </Button>
        </div>
    );
}
