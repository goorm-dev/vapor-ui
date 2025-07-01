'use client';

import { type ReactNode, useEffect } from 'react';

import { useTheme } from '@vapor-ui/core';

export function DocPageClient({ children }: { children: ReactNode }) {
    const { setTheme } = useTheme();

    useEffect(() => {
        setTheme({
            appearance: 'light',
        });
    }, [setTheme]);

    return <>{children}</>;
}
