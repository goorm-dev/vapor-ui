import type { ReactNode } from 'react';

import { HomeLayout } from 'fumadocs-ui/layouts/home';

import { baseOptions } from '~/app/layout.config';
import { SiteNavBar } from '~/components/site-nav-bar/site-nav-bar';

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <HomeLayout
            {...baseOptions}
            nav={{
                enabled: false,
            }}
        >
            <SiteNavBar />
            {children}
        </HomeLayout>
    );
}
