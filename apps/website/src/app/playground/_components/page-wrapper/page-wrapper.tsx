'use client';

import type { ReactNode } from 'react';

import { CustomThemeProvider } from '~/providers/theme';

import SiteNavBar from '~/components/site-nav-bar/site-nav-bar';

import { ThemePanel } from '../theme-panel';

interface PageWrapperProps {
    children: ReactNode;
}
const PageWrapper = ({ children }: PageWrapperProps) => {
    return (
        <CustomThemeProvider>
            <SiteNavBar />
            <ThemePanel />

            {children}
        </CustomThemeProvider>
    );
};

export { PageWrapper };
