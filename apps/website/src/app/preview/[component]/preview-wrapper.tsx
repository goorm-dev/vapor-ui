'use client';

import * as React from 'react';

import { DynamicComponent } from './dynamic-component';

interface PreviewWrapperProps {
    theme: string;
    componentPath?: string;
    children?: React.ReactNode;
}

export function PreviewWrapper({ theme, componentPath, children }: PreviewWrapperProps) {
    // Sync theme changes (e.g., when user switches theme while iframe is open)
    React.useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
            root.setAttribute('data-vapor-theme', 'dark');
        } else {
            root.classList.remove('dark');
            root.setAttribute('data-vapor-theme', 'light');
        }
    }, [theme]);

    if (componentPath) {
        return <DynamicComponent componentPath={componentPath} />;
    }

    return <>{children}</>;
}
