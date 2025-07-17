'use client';

import { useTheme } from '@vapor-ui/core';
import { DarkIcon, LightIcon } from '@vapor-ui/icons';

import { ButtonToggleGroup } from '../button-toggle-group';

export function ThemeToggle() {
    const { appearance, setTheme } = useTheme();

    const handleThemeChange = (index: number) => {
        const themes = ['light', 'dark'];
        setTheme({ appearance: themes[index] as 'light' | 'dark' });
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
