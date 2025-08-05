'use client';

import { useState } from 'react';

import { DarkIcon, LightIcon } from '@vapor-ui/icons';

import { ButtonToggleGroup } from '../button-toggle-group';

interface ThemeToggleProps {
    onThemeChange?: (theme: 'light' | 'dark') => void;
    defaultTheme?: 'light' | 'dark';
}

export function ThemeToggle({ onThemeChange, defaultTheme = 'dark' }: ThemeToggleProps) {
    const [appearance, setAppearance] = useState<'light' | 'dark'>(defaultTheme);

    const handleThemeChange = (index: number) => {
        const themes = ['light', 'dark'] as const;
        const newTheme = themes[index];
        setAppearance(newTheme);
        onThemeChange?.(newTheme);
    };

    const activeIndex = appearance === 'light' ? 0 : 1;

    return (
        <ButtonToggleGroup activeIndex={activeIndex} onToggle={handleThemeChange} size="md">
            <ButtonToggleGroup.Item>
                <span className="flex items-center gap-1">
                    <LightIcon />
                    Light
                </span>
            </ButtonToggleGroup.Item>
            <ButtonToggleGroup.Item>
                <span className="flex items-center gap-1">
                    <DarkIcon />
                    Dark
                </span>
            </ButtonToggleGroup.Item>
        </ButtonToggleGroup>
    );
}
