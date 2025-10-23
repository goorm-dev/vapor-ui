import type { ReactNode } from 'react';

import { ThemeProvider } from '@vapor-ui/core';
import type { Metadata } from 'next';

import { SiteNavBar } from '~/components/site-nav-bar/site-nav-bar';

export const metadata: Metadata = {
    title: 'Playground - Vapor UI',
};

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <>
            <ThemeProvider defaultTheme="system" storageKey="vapor-docs-theme">
                <SiteNavBar />
                {children}
            </ThemeProvider>
        </>
    );
}
