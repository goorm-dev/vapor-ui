'use client';

import { type ReactNode, useEffect } from 'react';

import { useTheme } from '@vapor-ui/core';

export function DocPageClient({ children }: { children: ReactNode }) {
    const { setTheme } = useTheme();

    useEffect(() => {
        setTheme({
            primaryColor: '#3B82F6',
            radius: 'md',
            scaling: 1.0,
        });
    }, [setTheme]);

    return <>{children}</>;
}
