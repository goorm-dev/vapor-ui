import type { ReactNode } from 'react';

import { SiteNavBar } from '~/components/site-nav-bar/site-nav-bar';

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <>
            <SiteNavBar />
            {children}
        </>
    );
}
