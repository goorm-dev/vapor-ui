'use client';

import type { ReactNode } from 'react';

import { ThemeProvider } from '@vapor-ui/core';

interface PlaygroundWrapperProps {
    children: ReactNode;
}

export function PlaygroundWrapper({ children }: PlaygroundWrapperProps) {
    return (
        <ThemeProvider>
            <div className="min-h-screen bg-background">
                <div className="container mx-auto p-6 h-full">{children}</div>
            </div>
        </ThemeProvider>
    );
}
