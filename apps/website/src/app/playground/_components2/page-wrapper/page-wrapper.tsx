'use client';

import type { ReactNode } from 'react';

import SiteNavBar from '~/components/site-nav-bar/site-nav-bar';

import { CUSTOM_THEME_DATA_ATTRIBUTES } from '../../_constants';
import { ThemePanel } from '../theme-panel';

interface PageWrapperProps {
    children: ReactNode;
}
const PageWrapper = ({ children }: PageWrapperProps) => {
    return (
        <>
            <SiteNavBar />
            <ThemePanel />

            <div {...{ [CUSTOM_THEME_DATA_ATTRIBUTES]: 'true' }}>{children}</div>
        </>
    );
};

export { PageWrapper };
