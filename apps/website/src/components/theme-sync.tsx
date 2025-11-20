'use client';

import { useEffect } from 'react';

import { useTheme } from '@vapor-ui/core';

export function ThemeSync() {
    const { resolvedTheme, mounted } = useTheme();

    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;
        if (resolvedTheme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [resolvedTheme, mounted]);

    return null;
}
