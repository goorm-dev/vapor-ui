'use client';

import { useTheme } from '@vapor-ui/core';
import { Button } from '@vapor-ui/core';

export function ThemeToggle() {
    const { appearance, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme({ appearance: appearance === 'light' ? 'dark' : 'light' });
    };

    return (
        <Button onClick={toggleTheme} variant="outline">
            {appearance === 'light' ? '🌙' : '☀️'}
            {appearance === 'light' ? '다크 모드' : '라이트 모드'}
        </Button>
    );
}
