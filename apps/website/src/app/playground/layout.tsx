import '@vapor-ui/core/styles.css';

import type { ReactNode } from 'react';

import { ThemeProvider, ThemeScript, createThemeConfig } from '@vapor-ui/core';
import type { Metadata } from 'next';

import { SiteNavBar } from '~/components/site-nav-bar/site-nav-bar';

export const metadata: Metadata = {
    title: 'Playground - Vapor UI',
};

const themeConfig = createThemeConfig({
    appearance: 'light',
    radius: 'md',
    scaling: 1,
});

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <>
            <ThemeScript config={themeConfig} />
            <ThemeProvider config={themeConfig}>
                <SiteNavBar />
                {children}
            </ThemeProvider>
        </>
    );
}
