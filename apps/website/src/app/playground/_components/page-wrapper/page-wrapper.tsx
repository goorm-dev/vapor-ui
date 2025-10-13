'use client';

import type { ReactNode } from 'react';

import SiteNavBar from '~/components/site-nav-bar/site-nav-bar';

import { ThemePanel } from '../theme-panel';

interface PageWrapperProps {
    children: ReactNode;
}
const PageWrapper = ({ children }: PageWrapperProps) => {
    return (
        <>
            <SiteNavBar />
            <ThemePanel />

            {children}
        </>
    );
};

export { PageWrapper };
